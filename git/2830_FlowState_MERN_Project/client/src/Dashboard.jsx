import { useState } from "react";
import { useEffect } from "react";
import { DragDropProvider, useDraggable, useDroppable } from "@dnd-kit/react";
import "./App.css";


function DraggableItem(props){
    const {ref} = useDraggable({
        id: props.id,
    });
    return (
        <div ref={ref} className="task">
            {props.children}
        </div>
    );
}

function Droppable({id, children}){
    const {ref} = useDroppable({
        id,
    });

    return (
        <div ref={ref} className="column">
            {children}
        </div>
    );
}



export default function Dashboard({ onSwitch, user }) {
    const [taskData, setTaskData] = useState({
         title: "",
         description: "",
         startDate: "",
         dueDate: "",
         priority: "Low",
         status: "To Do",
         assignee: user._id,
         project: "None"
    });
    const [children, setChildren] = useState([]);
    const [parent, setParent] = useState(null);
    const [target, setTarget] = useState();
    const [apiError, setApiError] = useState("");
    const [locations, setLocations] = useState({});
    const [tasks, setTasks] = useState([]);
    const [users, setUsers] = useState([]);

    const setTask = async (e) => {
        e.preventDefault();


        try {
        const res = await fetch('http://localhost:5000/api/tasks', {
            method: 'POST',
            headers: {
            'Content-Type':'application/json'
            },
            body: JSON.stringify({
                title: taskData.title,
                description: taskData.description,
                startDate: taskData.startDate,
                dueDate: taskData.dueDate,
                priority: taskData.priority,
                status: taskData.status,
                assignee: taskData.assignee,
                project: taskData.project
            })
        });
        const data = await res.json();
        if (res.status === 201){
            console.log(data._id);
            console.log(data.assignee);
            console.log(taskData.assignee);
            const newTask = {id: data._id, title: taskData.title, description: taskData.description, startDate: taskData.startDate, dueDate: taskData.dueDate, assignee: taskData.assignee};
            setTasks((prev) => [...prev, newTask]);
            setLocations((prev) => ({...prev, [data._id]: 'To Do',}));
            console.log("TASKS: ", tasks);
        }
        else {
            setApiError(data.message);
        }
        } catch (err) {
            setApiError(err.message || "An unexpected error has occured");
            (err) => { throw err; }
        } 
    };

    const deleteOne = async (e) => {
        console.log("DELETE CALL");
        try {
            console.log(e);
          const res = await fetch(`http://localhost:5000/api/tasks/${e.target.id}`, {
                method: 'DELETE',
                headers: {
                'Content-Type':'application/json'
                }
            }); 
            const data = await res.json();
           if (data.message === 'Task deleted successfully'){
                setTasks((prev) => prev.filter((task) => task.id !== e.target.id));
                setLocations((prev) => {
                    const updated = { ...prev };
                    delete updated[e.target.id];
                    return updated;
                });
           } 
           else {
            setApiError("error deleting task");
           }
        } catch (err) {
            setApiError("error during delete");
        }
    };

    const getTasks = async () => {
        console.log("GET TASK RUN");

        try {
            const res = await fetch('http://localhost:5000/api/tasks', {
                method: 'GET',
                headers: {
                'Content-Type':'application/json'
                }
            });
            const data = await res.json();
            if (res.status !== 500){
                const fetchedTasks = data.map((task) => ({ id: task._id, title: task.title, description: task.description, startDate: task.startDate, dueDate: task.dueDate, assignee: task.assignee }));
                setTasks(fetchedTasks);
                const fetchedLocations = {};
                data.forEach((task) => {
                    fetchedLocations[task._id] = task.status;
                });
                setLocations(fetchedLocations);
            }
            else {
                SetApiError("error occured when retrieving tasks");
            }
        } catch (err) {
            SetApiError("unable to retrieve tasks");
        } 
    };



    const handleChange = (e) => {
        const { id, value } = e.target;
        setTaskData((prev) => ({ ...prev, [id]: value }));
        if (apiError) setApiError("");
    };


    
    useEffect(() => {
        let curUsers = [{id: user._id, username: user.username}];
        console.log(user);
        console.log(user._id);
        setUsers(curUsers);
        getTasks();
    }, []);
            

    return (
        <DragDropProvider
            onDragEnd={async(event) => {
                if (event.canceled) return;
                
                const { source, target } = event.operation;
                if (target){
                    console.log(source.id, target.id);
                    setLocations((prev) => ({
                        ...prev,
                        [source.id]: target.id,
                    }));
                try{
                    const res = await fetch(`http://localhost:5000/api/tasks/${source.id}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type':'application/json'
                        },
                        body: JSON.stringify({
                            status: target.id
                        })
                    });
                    if (res.status === 404 || res.status === 500){
                        setApiError("Did not update");
                    }
                    else{
                        const data = await res.json();
                        console.log(data.title, data.status);
                        setApiError(""); 
                    }
                } catch (err){
                    setApiError(err.message);
                }      
                }
            }}
        >
            <div>
                <h1 className="test">Dashboard</h1>
                {apiError && (
                    <span>{apiError}</span>
                )}
                <main>
                    <div class="taskboard">
                        <Droppable key='To Do' id='To Do'>
                            <p class="columntext">To-Do</p>
                            {tasks
                                .filter((task) => locations[task.id] === 'To Do')
                                .map((task) => (
                                    <DraggableItem key={task.id} id={task.id}>
                                        <div className="taskhead">{task.title}<button id={task.id} onClick={deleteOne}>delete</button></div>
                                        <div className="taskbody"><div>{task.description}</div><div>Due: {task.dueDate}</div><div>Assigned user: {task.assignee.username}</div></div>
                                        {task.assignee._id === user._id && <div className="assigned">Assigned to you</div>}
                                    </DraggableItem>
                                ))}
                            {!tasks.some((task) => locations[task.id] === 'To Do') && `Drop Here`}
                            {children}
                        </Droppable>

                        <Droppable key='In Progress' id='In Progress'>
                            <p class="columntext">In Progress</p>
                            {tasks
                                .filter((task) => locations[task.id] === 'In Progress')
                                .map((task) => (
                                    <DraggableItem key={task.id} id={task.id}>
                                        <div className="taskhead">{task.title}<button id={task.id} onClick={deleteOne}>delete</button></div>
                                        <div className="taskbody"><div>{task.description}</div><div>Due: {task.dueDate}</div><div>Assigned user: {task.assignee.username}</div></div>
                                        {task.assignee._id === user._id && <div className="assigned">Assigned to you</div>}
                                    </DraggableItem>
                                ))}
                            {!tasks.some((task) => locations[task.id] === 'In Progress') && `Drop Here`}
                            {children}
                        </Droppable>

                        <Droppable key='Done' id='Done'>
                            <p class="columntext">Done</p>
                            {tasks
                                .filter((task) => locations[task.id] === 'Done')
                                .map((task) => (
                                    <DraggableItem key={task.id} id={task.id}>
                                        <div className="taskhead">{task.title}<button id={task.id} onClick={deleteOne}>delete</button></div>
                                        <div className="taskbody"><div>{task.description}</div><div>Due: {task.dueDate}</div><div>Assigned user: {task.assignee.username}</div></div>
                                        {task.assignee._id === user._id && <div className="assigned">Assigned to you</div>}
                                    </DraggableItem>
                                ))}
                            {!tasks.some((task) => locations[task.id] === 'Done') && `Drop Here`}
                            {children}
                        </Droppable>
                    </div>

                    <form className="form" onSubmit={setTask} noValidate>
                        <div>Create Task</div>
                        <div className="inputform">
                            <div className="inputdiv">
                                <label className="taskinputlabel" for="title">Task title </label>
                                <input type="text" id="title" value={taskData.title} onChange={handleChange}/>
                            </div>
                            <div className="inputdiv">
                                <label className="taskinputlabel" for="description">Task description </label>
                                <textarea id="description" value={taskData.description} onChange={handleChange}>
                                    Task description
                                </textarea>
                            </div>
                            <div className="inputdiv">
                                <label className="taskinputlabel" for="startdate">Task start date </label>
                                <input type="date" id="startDate" value={taskData.startDate} onChange={handleChange}/>
                            </div>
                            <div className="inputdiv">
                                <label className="taskinputlabel" for="duedate">Task due date </label>
                                <input type="date" id="dueDate" value={taskData.dueDate} onChange={handleChange}/>
                            </div>
                            <div className="inputdiv">
                                <label className="taskinputlabel" for="assignee">Task assignee </label>
                                <select id="assignee" value={taskData.assignee} onChange={handleChange}>
                                    {users.map((aUser) => (
                                        <option value={aUser.id}>{aUser.username}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="submitbutton">
                            <button type="submit">Create Task</button>
                        </div>
                    </form>
                </main>
            </div>
        </DragDropProvider>
    );
}