(function () {
    // get users
    (async function () {
        let users = await getRecords('Users');
        users.forEach(user => {
            let p = document.createElement('p');
            p.setAttribute('id', user.id);
            p.classList.add('p');
            p.innerHTML = user.name;
            p.addEventListener('click', function (e) {
                showForm(e, user);
            })
            document.querySelector('#users').prepend(p);
        });
    })();

    // add event lisnter to Add user button
    let addBtn = document.querySelector('.btn');
    addBtn.addEventListener('click', showForm);

    // functions
    function showForm(e, user = false) {
        let form = document.querySelector('#inputs-wrapper form');
        document.querySelector('#inputs-wrapper').style.display = 'block';
        if (user) {
            form['user-name'].value = user.name
        }
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            if (user) {
                if (user.password == form['user-password'].value) {
                    form.querySelector('.error').style.visibility = 'hidden';
                    sessionStorage.setItem('userId', user.id);
                    sessionStorage.setItem('userName', user.name);
                    window.location.href = './src/pages/projects.html';
                } else {
                    form.querySelector('.error').style.visibility = 'visible';
                }
            } else if (form['user-name'].value && form['user-password'].value) {
                let value = {
                    id: new Date().getTime(),
                    name: form['user-name'].value,
                    password: form['user-password'].value
                };
                insertRecords(value, 'Users', function () {
                    sessionStorage.setItem('userId', value.id);
                    sessionStorage.setItem('userName', value.name);
                    window.location.href = './src/pages/projects.html';
                });
            }
        })

    }

    // resize the window of the application
    const { ipcRenderer } = require('electron');
    ipcRenderer.send('window-load', {
        width: window.top.screen.availWidth,
        height: window.top.screen.height
    })
})()