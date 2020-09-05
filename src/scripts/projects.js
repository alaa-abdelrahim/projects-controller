(function () {
    // document Head
    document.querySelector('h1').innerHTML += `<span>${sessionStorage.getItem('userName')}</span>`;

    // array to stor all projects to avoid repeating projects' titles
    let allProjects = [];

    // create HTML
    createHTML();

    // bin event
    document.querySelector('.bin-svg-wrapper').addEventListener('dragover', function (event) {
        event.preventDefault();
    });
    document.querySelector('.bin-svg-wrapper').addEventListener('drop', dropHandler);

    // form event
    document.querySelector('form').addEventListener('submit', handleSubmit);

    // delete account event
    document.querySelector('#delete-account').addEventListener('click', handleDeleteAccount)

    // ---------------------------------------
    // Helper functions
    // ---------------------------------------

    // function to create html document from the stored data
    async function createHTML() {
        let projects = await getRecords('Projects', {
            userId: parseInt(sessionStorage.getItem('userId'))
        });
        document.querySelector('.projects').innerHTML = '';
        projects.forEach(project => {
            allProjects.push(project.title);
            let html = `
                    <div id="${project.id}" class="project">
                        <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="folder-open"
                            class="svg-inline--fa fa-folder-open fa-w-18" role="img" xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 576 512">
                            <path
                                d="M572.694 292.093L500.27 416.248A63.997 63.997 0 0 1 444.989 448H45.025c-18.523 0-30.064-20.093-20.731-36.093l72.424-124.155A64 64 0 0 1 152 256h399.964c18.523 0 30.064 20.093 20.73 36.093zM152 224h328v-48c0-26.51-21.49-48-48-48H272l-64-64H48C21.49 64 0 85.49 0 112v278.046l69.077-118.418C86.214 242.25 117.989 224 152 224z">
                            </path>
                        </svg>
                        <h2>${project.title}</h2>
                    </div>`
            document.querySelector('.projects').innerHTML += html
        });

        // add events
        let projectList = document.querySelectorAll('#projects .project');
        projectList.forEach(div => {
            div.addEventListener('dblclick', function () {
                sessionStorage.setItem('currentProject', div.getAttribute('id'));
                window.location.href = './tasks.html';
            })

            div.setAttribute('draggable', true);
            div.addEventListener('dragstart', function (event) {
                event.dataTransfer.setData('text', event.target.id);
            })
        })
    }

    // ------------------------------------------
    // events handlers
    // ------------------------------------------

    // section drop handlers
    async function dropHandler(e) {
        e.preventDefault();
        let projectId = event.dataTransfer.getData('text');
        this.classList.add('bin-big');
        let constraints = {
            userId: parseInt(sessionStorage.getItem('userId')),
            id: parseInt(projectId)
        }
        await deleteRecords('Projects', constraints);
        document.getElementById(`${projectId}`).remove();
        this.classList.remove('bin-big');
    }

    // submit new project handler
    async function handleSubmit(e) {
        e.preventDefault();
        if ((allProjects.filter(el => el == this.userInput.value)).length > 0) {
            alert('Already Exists');
        } else {
            let value = {
                title: this.userInput.value,
                userId: parseInt(sessionStorage.getItem('userId'))
            };
            await insertRecords(value, 'Projects', () => { });
            await createHTML();
            this.userInput.value = '';
        }
    }

    // delete account handler
    async function handleDeleteAccount(e) {
        let confirmation = confirm('If you delete your account, you wan\'t be able to restore your projects in future\n\nAre you sure that you want to delete your account?');
        if (confirmation) {
            await deleteRecords('Tasks', { userId: parseInt(sessionStorage.getItem('userId')) });
            await deleteRecords('Projects', { userId: parseInt(sessionStorage.getItem('userId')) });
            await deleteRecords('Users', { id: parseInt(sessionStorage.getItem('userId')) });
            window.location.href = '../../index.html';
        }
    }
})()