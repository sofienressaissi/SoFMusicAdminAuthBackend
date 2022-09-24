const router = require("express").Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const authAdmin = require("../middleware/authAdmin");
require('dotenv').config();
const admin = require("../models/admin");

router.post('/register', async(req, res) => {
    res.setHeader("Content-Type", "text/html");
    try {
        let {
            firstName,
            lastName,
            email,
            password
        } = req.body
        if (!firstName || !lastName || !email || !password) {
            return res.status(400).json({msg: "Not all fields have been entered"});
        }
        if (firstName.length < 4) {
            return res.status(400).json({msg: "The first name needs to be at least 4 characters long"});
        }
        if (lastName.length < 4) {
            return res.status(400).json({msg: "The last name needs to be at least 4 characters long"});
        }
        const existingAdmin = await admin.findOne({
            email: email
        })
        if (existingAdmin) {
            return res.status(400).json({msg: "An account with this email already exists"});
        }
        const salt = await bcrypt.genSalt();
        const passwordHash = await bcrypt.hash(password, salt);

        const newAdmin = new admin({
            dateCreation: Date.now(),
            firstName,
            lastName,
            email,
            password: passwordHash
        })
        const savedAdmin = await newAdmin.save();
        res.json(savedAdmin);
    } catch (err) {
        res.status(500).json(err.message);
    }
})

router.post("/login", async (req, res) => {
    try {
        const {
            email,
            password
        } = req.body
        if (!email || !password) {
            return res.status(400).json({msg: "Not all fields have been entered"});
        }
        const adminAuth = await admin.findOne({
            email: email
        })
        if (!adminAuth) {
            return res.status(400).json({msg: "No account with this email has been registered"});
        }
        const isMatch = await bcrypt.compare(password, adminAuth.password);
        if (!isMatch) {
            return res.status(400).json({msg: "Invalid credentials"});
        }
        const token = jwt.sign({
                id: adminAuth._id
            },
            process.env.JWT_ADMIN_SM);
        res.json({
            token,
            admin: {
                id: adminAuth._id,
                firstName: adminAuth.firstName,
                lastName: adminAuth.lastName,
                email: adminAuth.email,
                dateCreation: adminAuth.dateCreation
            }
        })
    } catch (err) {
        res.status(500).json(err.message);
    }
})

router.get("/", authAdmin, async (req, res) => {
    const adminn = await admin.findById(req.admin);
    res.json({
        id: adminn._id,
        firstName: adminn.firstName,
        lastName: adminn.lastName,
        email: adminn.email,
        dateCreation: adminn.dateCreation
    });
})

module.exports = router;