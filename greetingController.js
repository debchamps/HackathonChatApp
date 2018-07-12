function greetCustomer(username, callback) {
    callback("<strong>" + "ChatBot" + "</strong>  : Hi " + username + ", What can i order for you! </br>");
}

module.exports.greetCustomer = greetCustomer;