 const mail = require('@sendgrid/mail')
const sgMail = require('@sendgrid/mail')

const sendGridApiKey = process.env.SEND_GRID_API

sgMail.setApiKey(sendGridApiKey)

const welcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'ohtestgraphene@gmail.com',
        subject: 'welcome to the App',
        text: `Welcome ${name}. Happy to help you ` 
    })
}

const leavingEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'ohtestgraphene@gmail.com',
        subject: 'sad to see you go!',
        text: `Hey, ${name} . Sorry to see you go . Is there anything we can help you with?`
    })
}

module.exports = { welcomeEmail , leavingEmail}
