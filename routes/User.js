const express = require('express')
const passport = require('passport')
const passportConfig = require('../passport')
const User = require('../models/User')
const Note = require('../models/Note')
const JWT = require('jsonwebtoken')


const userRouter = express.Router()

const signToken = userID => {
    return JWT.sign({
        iss: 'vlad',
        sub: userID,
    }, 'secret', {expiresIn: "1d"})
}


userRouter.post('/register', async(req,res) => {
    const {username,password,role} = req.body
    try{
        const userExists = await User.findOne({username})
        if(userExists) res.status(400).     
        json({message: {msgBody: "Username is already taken", msgError: true}})
        
        await User.create({username,password,role})
        res.status(201).json({message: 
            {msgBody: "Account successfully created", msgError: false}})

    }catch(err){
        console.log(err)
    } 
})

userRouter.post('/login', passport.authenticate('local', {session: false}), (req,res) => {
    if(req.isAuthenticated()){
        const {_id,username,role} = req.user
        const token = signToken(_id)
        res.cookie('access_token', token, {httpOnly: true, sameSite: true})
        res.status(200).json({isAuthenticated: true, user: {username,role}})
    }
})

userRouter.get('/logout', passport.authenticate('jwt', {session: false}), (req,res) => {
    res.clearCookie('access_token')
    res.json({user: {username: "", role: ""}, success: true})
})


userRouter.get('/admin',passport.authenticate('jwt',{session: false}),(req,res) => {
    if(req.user.role === 'admin'){
        res.status(200).json({message: {msgBody: 'You are an admin', msgError: false}})
    }else{
        res.status(403).json({message: {msgBody: "You're not an admin,go away", msgError: true}})
    }
})

userRouter.get('/authenticated',passport.authenticate('jwt',{session: false}),(req,res) => {
    if(req.isAuthenticated()){
        const {username,role} = req.user
        res.status(200).json({isAuthenticated: true, user: {username,role}})
    }
})

userRouter.post('/note',passport.authenticate('jwt',{session: false}), async(req,res) => {
    try{
        const {title,body} = req.body
        if(!title || !body) return res.status(400).json({message: 'all fields are required'})

        const note = await Note.create({title,body})
        const user = await User.findById(req.user._id)
        const {notes} =  user
        notes.push(note)
        await user.save()
        res.status(200).json({success: true, user: user.username, userNotes: notes})
        
    }catch(err){
        console.log(err.message)
    }
})

userRouter.get('/note',passport.authenticate('jwt',{session: false}), async(req,res) => {
    try{

        const {notes} = await User.findById(req.user).populate({path: 'notes', select: '-__v'})
        return res.status(200).json({username: req.user.username,role: req.user.role, UserNotes: notes})

    }catch(err){
        console.log(err.message)
    }
})

userRouter.delete('/note/:id', passport.authenticate('jwt',{session: false}),async(req,res) => {
    try{
        const note = await Note.findOneAndDelete({_id: req.params.id})                    
        return res.status(200).json({deleted: true,deleted_note: note})
    }catch(err){
        console.log(err.message)
    }
})

userRouter.put('/note/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try{

        const {title,body} = req.body
        if(!title || !body) return res.status(400).json({message: 'all fields are required'})
        const note = await Note.findByIdAndUpdate(req.params.id,{title,body},{new: true})
        return res.status(200).json({success: true, updated_note: note})

    }catch(err){
        console.log(err.message)
    }
});
  

module.exports = userRouter