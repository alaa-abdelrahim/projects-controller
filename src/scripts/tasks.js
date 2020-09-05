(function () {
    let noteBtnClicked;
    let tasksMount;
    // get all data
    getAllTasks();

    // sections events
    let domSections = document.querySelectorAll('.tasksSection');
    domSections.forEach(sec => {
        sec.addEventListener('dragover', function (event) {
            event.preventDefault();
        });
        sec.addEventListener('drop', handleSectionDrop);
    });

    // submite btn event
    document.getElementById('submit').addEventListener('click', handleSubmit);

    // cancel and sav events
    document.getElementById('cancel').addEventListener('click', cancelNoteHandler);
    document.getElementById('save').addEventListener('click', saveNoteHandler);

    // -----------------------------------------
    // Helper functions
    // -----------------------------------------

    // function to get tasks data
    async function getAllTasks() {
        let tasksArr = await getRecords('Tasks', {
            userId: parseInt(sessionStorage.getItem('userId')),
            projectId: parseInt(sessionStorage.getItem('currentProject'))
        }, {
            colName: 'lastDrop',
            way: 'asc'
        })
        tasksMount = tasksArr.length || 0;
        tasksArr.forEach(task => {
            creatElement(task);
        });
    }

    // functions to create new element (task)
    function creatElement(objData) {
        let obj = {
            id: objData.id,
            value: objData.title,
            parent: objData.parent
        }
        let list = document.createElement('li');
        document.getElementById(obj.parent).appendChild(list);
        createListChildren(list, objData.id);
        document.getElementById(`span_${obj.id}` + '').innerText = obj.value;
        list.id = objData.id;
        list.setAttribute('draggable', true);
        list.addEventListener('dragstart', function (event) {
            sessionStorage.setItem('currentMovableTaskValue', list.children[0].children[0].innerHTML);
            event.dataTransfer.setData('text', event.target.id);
        });
    }

    function createListChildren(list, id) {
        //create elements
        let paragraph = document.createElement('p');
        let spanCreated = document.createElement('span');
        let icon = document.createElement('span');
        let uList = document.createElement('ul');
        let note = document.createElement('button');
        note.innerText = 'Notes';
        let del = document.createElement('button');
        del.innerText = 'Delete';

        // set IDs and Classes to them
        spanCreated.id = `span_${id}`;
        icon.id = 'i' + id;
        icon.innerHTML = '+';
        uList.className = 'listOptionsWrapper';
        note.className = 'notes';
        del.className = 'delete';

        // add event listener to them
        icon.addEventListener('click', handleIconClick);
        note.addEventListener('click', handleNoteBtnClick);
        del.addEventListener('click', handleDeleteBtnClick);

        // appent each one to parent
        list.appendChild(paragraph);
        list.appendChild(uList);
        paragraph.appendChild(spanCreated);
        paragraph.appendChild(icon);
        uList.appendChild(note);
        uList.appendChild(del);
    }

    // --------------------------------------
    // events handlers
    // --------------------------------------

    // section drop event handler
    async function handleSectionDrop(event) {
        if (event.target.className == 'tasksSection') {
            // to change the parent of the element in data
            let taskId = event.dataTransfer.getData('text')
            let constraints = {
                id: taskId,
                userId: parseInt(sessionStorage.getItem('userId')),
                projectId: parseInt(sessionStorage.getItem('currentProject'))
            }
            await updateRecord('Tasks', {
                parent: event.target.id,
                lastDrop: new Date().getTime()
            }, constraints).then(res => {
                event.target.appendChild(document.getElementById(taskId));
            })
        }
    }

    // submit btn handler
    async function handleSubmit(e) {
        if (document.getElementById('userInput').value) {
            e.preventDefault();
            let objData = {
                id: `user${sessionStorage.getItem('userId')}_'project${sessionStorage.getItem('currentProject')}_task${++tasksMount}`,
                title: document.getElementById('userInput').value,
                parent: 'inProgress',
                userId: parseInt(sessionStorage.getItem('userId')),
                projectId: parseInt(sessionStorage.getItem('currentProject')),
                desc: '',
                lastDrop: new Date().getTime()
            }
            await insertRecords(objData, 'Tasks', () => { })
                .then(res => {
                    creatElement(objData);
                })
            document.getElementById('userInput').value = '';
        } else {
            alert('There is no data to be added');
        }
    }


    // function to display ul list or hide it (toggle) of each task
    function handleIconClick(e) {
        let uList = document.getElementById(e.target.id).parentElement.nextSibling;
        if (e.target.innerHTML == '+') {
            e.target.innerHTML = '-';
            uList.style.display = 'block';
            uList.style.zIndex = '1';
        } else {
            e.target.innerHTML = '+';
            uList.style.display = 'none';
            uList.style.zIndex = '0';
        }
    }

    // note buton handler
    async function handleNoteBtnClick(e) {
        // close the ul of buttons 
        let icon = e.target.parentElement.parentElement.children[0].children[1];
        icon.innerHTML = '+';
        let uList = e.target.parentElement;
        uList.style.display = 'none';
        uList.style.zIndex = '0';

        // save which element clicked
        noteBtnClicked = e.target.parentElement.parentElement.id;

        // if this element has previous note --> display it
        let dbRecord = await getRecords('Tasks', {
            id: noteBtnClicked,
            userId: parseInt(sessionStorage.getItem('userId')),
            projectId: parseInt(sessionStorage.getItem('currentProject'))
        });
        document.getElementById('description').value = dbRecord[0].desc ? dbRecord[0].desc : '';

        // make note section appear and be stable after that
        document.getElementById('descrpContainer').style.animationName = 'show';
        setTimeout(function () {
            document.getElementById('descrpContainer').style.maxHeight = '90vh';
        }, 1800);

        // gave the background grey overlay
        document.getElementsByTagName('main')[0].className = 'mainAfter';
    }

    // cansel note handler 
    function cancelNoteHandler() {

        // empty the note text area
        setTimeout(function () {
            document.getElementById('description').value = '';
        }, 2000);

        // make note section disapear
        document.getElementById('descrpContainer').style.animationName = 'hide';
        setTimeout(function () {
            document.getElementById('descrpContainer').style.maxHeight = '0';
        }, 1800);

        // remove the background grey overlay
        document.getElementsByTagName('main')[0].className = '';
    }

    // save note handler
    async function saveNoteHandler() {
        await updateRecord('Tasks', {
            desc: document.getElementById('description').value
        }, {
            id: noteBtnClicked,
            userId: parseInt(sessionStorage.getItem('userId')),
            projectId: parseInt(sessionStorage.getItem('currentProject'))
        })

        // empty the note text area and close it
        cancelNoteHandler();
    }

    // delete task btn handler
    async function handleDeleteBtnClick(e) {
        let confirmation = confirm('Do you want to delete this task?');

        if (confirmation) {
            let targetId = e.target.parentElement.parentElement.id;
            await deleteRecords('Tasks', {
                id: targetId,
                userId: parseInt(sessionStorage.getItem('userId')),
                projectId: parseInt(sessionStorage.getItem('currentProject'))
            })

            // delete from dom tree
            document.getElementById(targetId).remove();
        }
    }
})()