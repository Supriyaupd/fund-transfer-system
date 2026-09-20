const router = require('express').Router()
const mongoose = require('mongoose')
const auth = require('../middleware/auth')
const User =  require('../models/User')
const Transaction = require('../models/Transaction')
const bcrypt = require('bcryptjs')

router.post('/send', auth, async (req, res) => {
  try {
    const { receiverPhone, amount, description, pin } = req.body

    if (!receiverPhone || !amount || !pin) {
      return res.status(400).json({ message: 'Receiver phone, amount and PIN are required' })
    }

    if (amount <= 0) {
      return res.status(400).json({ message: 'Amount must be greater than 0' })
    }

    const sender = await User.findById(req.userId)

    if (!sender.pin) {
      return res.status(400).json({ message: 'Please set your transaction PIN first' })
    }

    const isPinValid = await bcrypt.compare(pin, sender.pin)
    if (!isPinValid) {
      return res.status(400).json({ message: 'Invalid PIN' })
    }

    const receiver = await User.findOne({ phone: receiverPhone })

    if (!receiver) {
      return res.status(404).json({ message: 'Receiver not found' })
    }

    if (sender._id.toString() === receiver._id.toString()) {
      return res.status(400).json({ message: 'Cannot send money to yourself' })
    }

    if (sender.balance < amount) {
      return res.status(400).json({ message: 'Insufficient balance' })
    }

    const session = await mongoose.startSession()
    session.startTransaction()

    try {
      const balanceBefore = sender.balance

      sender.balance -= amount
      await sender.save({ session })

      receiver.balance += amount
      await receiver.save({ session })

      const transactionId = 'TXN' + Date.now() + Math.floor(Math.random() * 1000)

      const transaction = await Transaction.create([{
        transactionId,
        senderId: sender._id,
        receiverId: receiver._id,
        senderPhone: sender.phone,
        receiverPhone: receiver.phone,
        amount,
        type: 'send',
        status: 'completed',
        description: description || '',
        balanceBefore,
        balanceAfter: sender.balance
      }], { session })

      await session.commitTransaction()
      session.endSession()

      res.status(201).json({
        message: 'Transaction successful',
        transaction: transaction[0],
        newBalance: sender.balance
      })

    } catch (error) {
      await session.abortTransaction()
      session.endSession()
      res.status(500).json({ message: 'Transaction failed', error: error.message })
    }

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
})

router.post('/topup', auth, async (req, res) => {
  try {
    const { amount, pin } = req.body

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Valid amount is required' })
    }

    if (!pin) {
      return res.status(400).json({ message: 'PIN is required' })
    }

    const user = await User.findById(req.userId)

    if (!user.pin) {
      return res.status(400).json({ message: 'Please set your transaction PIN first' })
    }

    const isPinValid = await bcrypt.compare(pin, user.pin)
    if (!isPinValid) {
      return res.status(400).json({ message: 'Invalid PIN' })
    }

    const balanceBefore = user.balance

    user.balance += amount
    await user.save()

    const transactionId = 'TXN' + Date.now() + Math.floor(Math.random() * 1000)

    const transaction = await Transaction.create({
      transactionId,
      senderId: user._id,
      receiverId: user._id,
      senderPhone: user.phone,
      receiverPhone: user.phone,
      amount,
      type: 'topup',
      status: 'completed',
      description: 'Wallet top-up',
      balanceBefore,
      balanceAfter: user.balance
    })

    res.status(201).json({
      message: 'Top-up successful',
      transaction,
      newBalance: user.balance
    })

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
})

router.get('/history', auth, async (req, res) => {
  try {
    const userId = req.userId

    const transactions = await Transaction.find({
      $or: [{ senderId: userId }, { receiverId: userId }]
    })
      .sort({ createdAt: -1 })
      .populate('senderId', 'name phone')
      .populate('receiverId', 'name phone')

    res.json({ transactions })

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
})

module.exports = router