var Users = {// users db
    demo:{
        /* static changable data (for DB) */
        id: 'demo',
        // require('crypto').createHash('sha1').update(pass).digest('hex')
        pass: '9d4e1e23bd5b727046a9e3b4b7db57bd8d6ee684',
        roles: [ 'developer.local', 'admin.local', 'developer' ],
        name:'Demo Демо',
    }
}

module.exports = Users
