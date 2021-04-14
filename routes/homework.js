const express = require('express');
const multer = require('multer');
const db = require('../database/db');
const router = express.Router();
const token = require('../middleware/token');

const storage = multer.diskStorage({
    destination:(req,file,cb) => {
        cb(null,'views/uploads');
    },
    filename:(req, file, cb)=>{
        cb(null, new Date().getTime() +'-'+ file.originalname);
    }
});

const upload = multer({storage:storage});

router.get('/', token.required, (req, res) => {

    var query;
    var values;

    if(req.query.filter){
        const filtro = req.query.filter;

        if(filtro == 'concluidas'){

                            query = `SELECT
                                    homeworks.title,
                                    homeworks.created_at,
                                    homeworks.delivery_date,
                                    homeworks.homework_id,
                                    subjects.subject_name,
                                    done_homeworks.student_id
                                FROM
                                    homeworks
                                INNER JOIN subjects ON homeworks.subject_id = subjects.subject_id
                                INNER JOIN done_homeworks ON homeworks.homework_id = done_homeworks.homework_id
                                WHERE 
                                    homeworks.homework_id = done_homeworks.homework_id
                                AND     
                                    done_homeworks.student_id = ?
                                LIMIT 10`;

                    values = [req.user.user_id];

                     }


    } 
    else{
        query = `SELECT
        homeworks.title,
        homeworks.created_at,
        homeworks.delivery_date,
        homeworks.homework_id,
        subjects.subject_name
            FROM
                homeworks
            INNER JOIN subjects ON homeworks.subject_id = subjects.subject_id
            WHERE homeworks.classroom_id = ?
            LIMIT 10`;

        values = [req.user.user_classroom_id];

    } 

    function afterConsultData(error, result){
        if(error){
            res.send("Erro na consulta");
        }else{
            res.render('homework.html',{ homeworks : result, user : req.user })
        }
    }
    db.all(query, values, afterConsultData);
});

router.get('/:id_tarefa', token.required, (req,res)=>{
    const id_tarefa = req.params.id_tarefa;
    
    const query = `SELECT
                    homeworks.title,
                    homeworks.description,
                    homeworks.homework_id,
                    homeworks.delivery_date,
                    homeworks.created_at,
                    homeworks.archives,
                    subjects.subject_name
                FROM
                    homeworks
                INNER JOIN subjects ON homeworks.subject_id = subjects.subject_id
                WHERE homeworks.homework_id = ${id_tarefa}`;

        function afterConsultData(error, result){
            if(error){
                console.log(error);
                res.send("Erro na consulta");
            }else{
                res.render('homework-selected.html',{ homework: result, user:req.user});
            }
        }
        db.get(query,afterConsultData);
});

router.post('/:id_tarefa', token.required, upload.single('homework'), (req,res)=>{
    const query = `INSERT INTO done_homeworks(homework_id, student_id, archives)
                    VALUES (?,?,?)`;

    const values = [req.params.id_tarefa, req.user.user_id,req.file.filename];

    function afterInsertData(error){
        if(error){
            console.log(error);
            res.send("Erro no servidor");
        }
        else{
            res.send("Tarefa concluída com sucesso!!");
        }
    }

    db.run(query, values, afterInsertData);
});

module.exports = router;