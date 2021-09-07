const router = require('express').Router()
const NoteModel = require('./model')
const passportNew = require('../auth')


//GET
router.get('/',
  (req, res, next)=>{
    NoteModel.find()
      .then((results)=>{
        if(!results){
          res
            .status(400)
            .send('No Notes Found')
        }else{
          res.json(results)
        }
      })
      .catch((err)=>{
        console.log(err);
        res
          .status(500)
          .send('Error Happened')
      })
})

//GET BY ID
router.get('/:id', (req, res, next)=>{
  NoteModel.findById(req.params.id)
    .then((results)=>{
      if(!results){
        res
          .status(400)
          .send('No Note Found')
      }else{
        res.json(results)
      }
    })
    .catch((err)=>{
      console.log(err);
      res
        .status(500)
        .send('Error Happened')
    })
})

//Create
router.post('/',
  passportNew.authenticate('bearer', { session: false }),
  inputValidation,
  (req, res, next)=>{
  const newNote = new NoteModel({
    title: req.body.title,
    body: req.body.body,
    authorId: req.user._id
  })

  newNote
      .save()
      .then((document)=>{
        if(document){
          res.json(document)
        }else{
          res.send('document did not save')
        }
      })
      .catch((err)=>{
        console.log(err);
        res.send("Error Happened")
      })
})

//Update
router.put('/:id',
  passportNew.authenticate('bearer', { session: false }),
  updateInputValidation,
  findNote,
  isAuthor,
  (req, res, next)=>{
    NoteModel.findOneAndUpdate({ _id: req.params.id}, req.updateObj, {
      new: true
    })
    .then((results)=>{
      if(!results){
        res
          .status(400)
          .send('No Note Found')
      }else{
        res.json(results)
      }
    })
    .catch((err)=>{
      console.log(err);
      res
        .status(500)
        .send('Error Happened')
    })
})

//Delete
router.delete('/:id',
  passportNew.authenticate('bearer', { session: false }),
  findNote,
  isAuthor,
  (req, res, next)=>{
    NoteModel.findOneAndRemove({ _id: req.params.id})
    .then((results)=>{
      if(!results){
        res
          .status(400)
          .send('No Note Found')
      }else{
        res.send('Successfully Deleted')
      }
    })
    .catch((err)=>{
      console.log(err);
      res
        .status(500)
        .send('Error Happened')
    })
})

function inputValidation(req, res, next){
  const { title, body } = req.body
  const missingFields = []

  if(!title){
    missingFields.push('title')
  }
  if(!body){
    missingFields.push('body')
  }
  if(missingFields.length){
    res
      .status(400)
      .send(`The following fields are missing: ${missingFields.join(', ')}`)
  }else{
    next()
  }
}

function updateInputValidation(req, res, next){
  const { title, body } = req.body
  const updateObj = {}

  if(title){
    updateObj.title = title
  }
  if(body){
    updateObj.body = body
  }

  req.updateObj = updateObj

  next()
}

function findNote(req, res, next){
  NoteModel.findById(req.params.id)
    .then((noteDocument)=>{
      if(!noteDocument){
        res.status(404).send('Note not found')
      }else{
        req.noteDocument = noteDocument
        next()
      }
    })
    .catch((err)=>{
      console.log(err);
      res.status(500).send('Error Happened')
    })
}

function isAuthor(req, res, next){
  if(req.user._id.equals(req.noteDocument.authorId)){
    next()
  }else{
    res.status(401).send('you are not authorised')
  }
}

module.exports = router