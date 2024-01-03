const Expense = require('../models/expenses');
const User = require('../models/user');
const sequelize = require('../util/database');

function isstringnotvalid(string) {         //This function will return true if string not valid
    if (string == undefined || string.length === 0) {
        return true;
    }
    else {
        return false;
    }
}

function isintegernotvalid(int) {         //This function will return true if string not valid
    if (int == undefined || int.length === 0) {
        return true;
    }
    else {
        return false;
    }
}

const addexpense = async(req, res) => {
    const t =await sequelize.transaction();
    try{
    const {expenseamount, category, description} = req.body;

    if (isintegernotvalid(expenseamount) || isstringnotvalid(category) || isstringnotvalid(description)) {
        return res.status(400).json({ err: "Bad parameters - Something is missing" })
    }

    const expense = await Expense.create({expenseamount, category, description, userId: req.user.id}, {transaction: t})
    const totalExpense = Number(req.user.totalExpenses)+ Number(expense.expenseamount)
    console.log(totalExpense);
    await User.update({
        totalExpenses : totalExpense
    },{
        where: {id: req.user.id},
        transaction: t
    })
        await t.commit();
        return res.status(201).json({expense, success: true});
    
}catch(err){
        await t.rollback();
        return res.status(500).json({success: false, error: err})
}}


const getexpenses = async(req, res, next)=> {
    try{
    const expenses = await Expense.findAll({where: {userId: req.user.id}});

   
    res.status(200).json({allExpenses: expenses});
    }
    catch(error){
        console.log('Get Expenses is failing', JSON.stringify(error));
        res.status(500).json({error: error});
    }
}

const deleteexpense = async (req, res) => {
    const t =await sequelize.transaction();

    try{
    
        const expenseid = req.params.expenseid;
        const expense =  await Expense.findAll({where: {id: expenseid}});
        const expenseamount = expense[0].expenseamount;
        const userId = expense[0].userId;

        // console.log(expenseid)
        // console.log(expense)
        // console.log("This is line 71")
        // console.log(expense[0].expenseamount)

        // console.log(expenseamount)
        // console.log(userId)

        
        if(expenseid == undefined || expenseid.length === 0)
        {
            res.status(400).json({success: false})
        }
        const user =  await User.findAll({where: {id: userId}})
        // console.log("this is line 86")
        // console.log(user[0])
        // console.log("this is line 88")

        var totalExpense = user[0].totalExpenses;// Here totalExpense variable in created. 
        // Aii totalExpense and User table er totalExpenses object er sathe gomal kore felbe na jano
        console.log(totalExpense)
        console.log(expenseamount)

        totalExpense = totalExpense - expenseamount;
        console.log(totalExpense)
        await User.update({
            totalExpenses : totalExpense
        },{
            where: {id: userId},
            transaction: t
        })
        const deatroy = await Expense.destroy({where: {id: expenseid}}, {transaction: t})


            await t.commit();
            return res.status(200).json({success: true, message: 'Deleted successfuly'})
        }
        catch(err){
            // console.log(err);
            await t.rollback();
            return res.status(500).json({ success: false, message: 'Failed'})
        }

        

}


module.exports = {
    addexpense,
    getexpenses,
    deleteexpense
}