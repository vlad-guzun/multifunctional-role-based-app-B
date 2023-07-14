const manageRouter = require('express').Router()
const passport = require('passport')
const User = require('../models/User')

manageRouter.get('/users',passport.authenticate('jwt',{session: false}),async(req,res) => {
    if(req.user.role !== 'Superadmin'){
        res.status(403).json({message: 'ACCESS DENIED! You are not an admin'})
    }
    const users = await User.find({role: 'user'})
    res.status(200).json(users)
})

manageRouter.get('/admins',passport.authenticate('jwt',{session: false}),async(req,res) => {
    if(req.user.role !== 'Superadmin'){
        res.status(403).json({message: 'ACCESS DENIED! You are not an admin'})
    }
    const admins = await User.find({role: 'admin'})
    res.status(200).json(admins)
})

manageRouter.delete('/user/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
      if (req.user.role !== 'Superadmin') {
       return res.status(403).json({ message: 'ACCESS DENIED! You are not an admin' });
      }
      const user = await User.findByIdAndDelete(req.params.id);
      if (!user) {
        return res.status(404).json({ message: 'user not found' });
      }
       return res.status(200).json({ message: 'user deleted' });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  manageRouter.delete('/admins/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
      if (req.user.role !== 'Superadmin') {
       return res.status(403).json({ message: 'ACCESS DENIED! You are not an admin' });
      }
      const user = await User.findByIdAndDelete(req.params.id);
      if (!user) {
        return res.status(404).json({ message: 'admin not found' });
      }
       return res.status(200).json({ message: 'admin deleted' });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });


  manageRouter.patch('/promote/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
      if (req.user.role !== 'Superadmin') {
        return res.status(403).json({ message: 'You are not the superadmin' });
      }
  
      const { id } = req.params; 
      const user = await User.findById(id);
  
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      user.role = 'admin';
      await user.save();  

      console.log(user);  
  
      res.status(200).json({ message: { updated: true, user: user, newRole: user.role } });
    } catch (err) {
      console.log(err.message);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  



module.exports = manageRouter