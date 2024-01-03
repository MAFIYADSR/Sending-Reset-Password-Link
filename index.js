// const Razorpay = require('razorpay');

async function addNewExpense(e){
    try
    {
    e.preventDefault()

    const expenseDetails = {
        expenseamount : e.target.expenseamount.value,
        description : e.target.description.value,
        category : e.target.category.value
    }
    console.log(expenseDetails)
    const token = localStorage.getItem('token')
    const response = await axios.post('http://localhost:3000/expense/addexpense', expenseDetails, {headers: {"Authorization": token}})
        addNewExpensetoUI(response.data.expense);
}
catch(err)
{
    // showError(err);
    console.log(err);
}
}

function showPremiumUserMessage(){
    document.getElementById('rzp-button1').style.visibility = "hidden"
    document.getElementById('message').innerHTML = "You are a premium user"
}

function parseJwt (token) {         //This is the code to decode token in frontend
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
}

window.addEventListener('DOMContentLoaded', ()=>{
    const token = localStorage.getItem('token')
    // const token  = req.header('Authorization');

    const decodedToken = parseJwt(token);
    console.log(decodedToken);
    if(decodedToken.ispremiumuser == true)
    {
        showPremiumUserMessage();
        showLeaderboard();
    }
    
    axios.get('http://localhost:3000/expense/getexpenses', { headers: {"Authorization": token}})
        .then(response => {
        // console.log(response);

        for(var i = 0; i<response.data.allExpenses.length; i++){
            addNewExpensetoUI(response.data.allExpenses[i]);
        }
        }).catch(err => {
            // showError(err);
            console.log(err);
        })
    })


function addNewExpensetoUI(expense) //
{
    const parentNode = document.getElementById('listofExpenses');

            const childHTML = `<li id = ${expense.id}> ${expense.expenseamount} - ${expense.category} -> ${expense.description}
                        <button onclick=deleteExpense('${expense.id}')> Delete </button>
                    </li>`

            parentNode.innerHTML = parentNode.innerHTML + childHTML;
}

function deleteExpense(expenseId)
{
    axios.delete(`http://localhost:3000/expense/deleteexpense/${expenseId}`)
        .then((response) => {
            removeExpenseFromScreen(expenseId);
        })
        .catch((err) => {
            // showError(err);
            console.log(err);
        })
}

function removeExpenseFromScreen(expenseId)
{
    const parentNode = document.getElementById('listofExpenses');
    const childNodeToBeDeleted = document.getElementById(expenseId);
    if(childNodeToBeDeleted){
        parentNode.removeChild(childNodeToBeDeleted);
    }

}

document.getElementById('rzp-button1').onclick = async function(e) {
    const token = localStorage.getItem('token');
    const response = await axios.get('http://localhost:3000/purchase/premiummembership', {headers: {"Authorization" : token}});
    console.log(response);
    // console.log("I am here")
    var options = 
    {
        "key": response.data.key_id, //Enter the key id generated from the Dashboard
        "order_id": response.data.order.id, //For one time payment
        //This handler function will handle the success payment 
        "handler": async function (response) {
           const res =  await axios.post('http://localhost:3000/purchase/updateTransactionStatus', {
                order_id: options.order_id,
                payment_id: response.razorpay_payment_id,
            }, { headers: {"Authorization" : token}})

            console.log(res);
            alert('You are a Premium User now')
            document.getElementById('rzp-button1').style.visibility = "hidden"
            document.getElementById('message').innerHTML = "You are a premium user"
            localStorage.setItem('token', res.data.token);

        },
    };

    const rzp1 = new Razorpay(options);
    rzp1.open();
    e.preventDefault();

    rzp1.on('payment.failed', function (response){
        console.log(response);
        alert('Something went wrong')
    })
}

function showLeaderboard(){
    const inputElement = document.createElement("input")
    inputElement.type = "button"
    inputElement.value = "Show Leaderboard"
    inputElement.onclick = async() => {
        const token = localStorage.getItem('token')
        const userLeaderBoardArray = await axios.get('http://localhost:3000/premium/showLeaderBoard', {headers: {"Authorization" : token}})
        console.log(userLeaderBoardArray)

        var leaderboardElem = document.getElementById('leaderboard')
        leaderboardElem.innerHTML += '<h1> Leader Board </h1>'
        userLeaderBoardArray.data.forEach((userDetails) => {
        
        leaderboardElem.innerHTML += ` <li>Name - ${userDetails.name} Total Expense - ${userDetails.totalExpenses || 0}</li>`

        })
    }
    document.getElementById("message").appendChild(inputElement);
}

// const expenseElemId = `expense-${expenseId}`;
//     document.getElementById(expenseElemId).remove();