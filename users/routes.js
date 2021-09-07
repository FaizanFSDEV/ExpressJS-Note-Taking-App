const router = require('express').Router()
const UserModel = require('./model')
const bcrypt = require('bcryptjs')
const Chance = require('chance')
const chance = new Chance()

router.post('/login',
  loginInputValidation,
  findUser,
  checkPassword,
  giveAccess)

router.post('/register',
  registerInputValidation,
  isEmailRegistered,
  encryptPassword,
    (req, res, next)=>{
      const newUser = new UserModel({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: req.body.password,
      })

      newUser
          .save()
          .then((document)=>{
            if(document){
              document.password =  undefined
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

router.get('/:id', (req, res, next)=>{
  UserModel
    .findById(req.params.id)
    .then((result)=>{
      if(!result){
        res
          .status(404)
          .send('User not found')
      }else{
        result.password = undefined
        res.json(result)
      }
    })
    .catch((err)=>{
      console.log(err);
      res
        .status(500)
        .send('Error Happened')
    })
})

function registerInputValidation(req, res, next){
  const { firstName, lastName, email, password } = req.body
  const missingFields = []

  if(!firstName){
    missingFields.push('firstName')
  }
  if(!lastName){
    missingFields.push('lastName')
  }
  if(!email){
    missingFields.push('email')
  }
  if(!password){
    missingFields.push('password')
  }
  if(missingFields.length){
    res
      .status(400)
      .send(`The following fields are missing: ${missingFields.join(', ')}`)
  }else{
    next()
  }
}

function isEmailRegistered(req, res, next){
  const { email } = req.body

  UserModel.findOne( {email} )
    .then((result)=>{
      if(result){
        res
          .status(400)
          .send(`${email} is already registered`)
      }else{
        next()
      }
    })
    .catch((err)=>{
      console.log(err);
      res.status(500).send('Error Happened')
    })
}

function encryptPassword(req, res, next){
  const { password } = req.body
  
  bcrypt.genSalt(10,(err, salt)=>{
    bcrypt.hash(password, salt, (err, passwordHash)=>{
        if(err){
          res.status(500).send('Error')
        }else{
          req.body.password = passwordHash
          next()
        }
    });
});
}

function loginInputValidation(req, res, next){
  const { email, password } = req.body
  const missingFields = []

  if(!email){
    missingFields.push('email')
  }
  if(!password){
    missingFields.push('password')
  }
  if(missingFields.length){
    res
      .status(400)
      .send(`The following fields are missing: ${missingFields.join(', ')}`)
  }else{
    next()
  }
}

function findUser(req, res, next){
  const { email } = req.body
  UserModel
    .findOne({ email: email })
    .then((userDocument)=>{
      if(!userDocument){
        res
          .status(404)
          .send(`${email} is not registered`)
      }else{
        req.userDocument = userDocument
        next()
      }
    })
    .catch((err)=>{
      console.log(err);
      res
        .status(500)
        .send('Error Happened')
    })
}

function checkPassword(req, res, next){
  const hashPassword = req.userDocument.password
  const { password } = req.body

  bcrypt.compare(password, hashPassword, function(err, isPasswordCorrect){
    if(err){
      console.log(err);
      res.status(500)
    }else if(isPasswordCorrect){
    next()
    }else{
      res.status(400).send('Password is incorrect')
    }
  })
}

function giveAccess(req, res, next){
  const accessToken = chance.guid()
 
  req.userDocument.accessToken = accessToken
  req.userDocument
    .save()
    .then((result)=>{
      if(result){
        res.send(accessToken)
      }else{
        res
          .status(400)
          .send('Error')
      }
    })
    .catch((err)=>{
      console.log(err);
      res
        .status(500)
        .send('Error Happened')
    })
}

module.exports = router