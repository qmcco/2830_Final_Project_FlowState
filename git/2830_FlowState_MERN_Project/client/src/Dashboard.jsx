import { useRef, useState, useEffect } from "react";
import { DragDropProvider, useDraggable, useDroppable } from "@dnd-kit/react";
import "./App.css";
import { useAuth } from "./contexts/AuthContext";
import api from './api';


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

function Sidebar({ user, onLogout }) {
	const teamDialogRef = useRef(null);
	const teams = user?.teams || [];
	const name = user?.name || user?.username || "No name available";
	const email = user?.email || "No email available";

	const initials = name.split(" ").map(name => name[0]).join("").toUpperCase();
	const teamNames = teams.map((team) => team?.name || team).filter(Boolean);
	const createTeam = () => {
		teamDialogRef.current?.showModal();
	};

	return (
		<aside className="sidebar">
			<div className="user-info">
				<div className="user-initials">
					{initials}
				</div>
				<div className="user-details">
					<h3>{name}</h3>
					<p>{email}</p>
				</div>
			</div>
			<div className="teams">
				<h4>Teams</h4>
				{teamNames.length > 0 ? (
					<ul>
						{teamNames.map((team, index) => (
							<li key={index}>{team}</li>
						))}
					</ul>
				) : (
					<p>No teams yet</p>
				)}
			</div>
			<div className="create-team">
				<button onClick={createTeam}>Create Team</button>
				<button onClick={onLogout}>Logout</button>
			</div>
			{/* TODO: Add ability to create team */}
			<dialog ref={teamDialogRef} className="team-dialog" closedby="any">
				<form method="dialog" className="team-dialog-form">
					<h3>Create Team</h3>
					<label htmlFor="teamName">Team name</label>
					<input id="teamName" type="text" placeholder="Team name" />
					<div className="team-dialog-actions">
						<button type="submit">Create</button>
						<button type="submit">Cancel</button>
					</div>
				</form>
			</dialog>
		</aside>
	)
}

export default function Dashboard() {
	const { logout, user } = useAuth();
    const [taskData, setTaskData] = useState({
		title: "",
		description: "",
		startDate: "",
		dueDate: "",
		priority: "Low",
		status: "To Do",
		assignee: user?._id,
		project: ""
    });
    const [children, setChildren] = useState([]);
    const [parent, setParent] = useState(null);
    const [target, setTarget] = useState();
    const [apiError, setApiError] = useState("");
    const [locations, setLocations] = useState({});
    const [tasks, setTasks] = useState([]);
    const [users, setUsers] = useState(user ? [{id: user._id, username: user.username}] : []);

    const setTask = async (e) => {
        e.preventDefault();


        try {
            const payload = {
                title: taskData.title,
                description: taskData.description,
                startDate: taskData.startDate,
                dueDate: taskData.dueDate,
                priority: taskData.priority,
                status: taskData.status,
                assignee: taskData.assignee,
            };

            if (taskData.project) {
                payload.project = taskData.project;
            }

            const { data } = await api.post("/tasks", payload);

			console.log(data._id);
			console.log(data.assignee);
			console.log(taskData.assignee);
			const newTask = {id: data._id, title: taskData.title, description: data.description, startDate: data.startDate, dueDate: data.dueDate, assignee: data.assignee};
			setTasks((prev) => [...prev, newTask]);
			setLocations((prev) => ({...prev, [data._id]: 'To Do',}));
			console.log("TASKS: ", tasks);
        } catch (err) {
            setApiError(err.message || "An unexpected error has occured");
        } 
    };

    const deleteOne = async (e) => {
        console.log("DELETE CALL");
        try {
            console.log(e);
          	await api.delete(`/tasks/${e.target.id}`);

           	setTasks((prev) => prev.filter((task) => task.id !== e.target.id));
			setLocations((prev) => {
				const updated = { ...prev };
				delete updated[e.target.id];
				return updated;
			});
        } catch (err) {
            setApiError(err.message || "error deleting task");
        }
    };

    const handleChange = (e) => {
        const { id, value } = e.target;
        setTaskData((prev) => ({ ...prev, [id]: value }));
        if (apiError) setApiError("");
    };


    
    useEffect(() => {
        if (!user) return;

		const getTasks = async () => {
			console.log("GET TASK RUN");

			try {
				const { data } = await api.get("/tasks");
				if (data.status !== 500){
					const fetchedTasks = data.map((task) => ({ id: task._id, title: task.title, description: task.description, startDate: task.startDate, dueDate: task.dueDate, assignee: task.assignee }));
					setTasks(fetchedTasks);
					const fetchedLocations = {};
					data.forEach((task) => {
						fetchedLocations[task._id] = task.status;
					});
					setLocations(fetchedLocations);
				}
				else {
					setApiError("error occured when retrieving tasks");
				}
			} catch (err) {
				setApiError(err.message || "error occured when retrieving tasks");
			} 
    	};


        console.log(user);
        console.log(user._id);
        getTasks();
    }, [user]);
	
	if (!user) {
		return null;
	}

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
                    const { data } = await api.put(`/tasks/${source.id}`, {
						status: target.id
					});
                    if (data.status === 404 || data.status === 500){
                        setApiError("Did not update");
                    }
                    else{
                        console.log(data.title, data.status);
                        setApiError(""); 
                    }
                } catch (err){
                    setApiError(err.message);
                }      
                }
            }}
        >
            <div className="dashboard-page">
                <Sidebar user={user} onLogout={logout} />
                <main className="dashboard-main">
                    <h1 className="test">Dashboard</h1>
                    {apiError && (
                        <span>{apiError}</span>
                    )}
                    <div className="taskboard">
                        <Droppable key='To Do' id='To Do'>
                            <p className="columntext">To-Do</p>
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
                            <p className="columntext">In Progress</p>
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
                            <p className="columntext">Done</p>
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
                                <label className="taskinputlabel" htmlFor="title">Task title </label>
                                <input type="text" id="title" value={taskData.title} onChange={handleChange}/>
                            </div>
                            <div className="inputdiv">
                                <label className="taskinputlabel" htmlFor="description">Task description </label>
                                <textarea id="description" value={taskData.description} onChange={handleChange}>
                                    Task description
                                </textarea>
                            </div>
                            <div className="inputdiv">
                                <label className="taskinputlabel" htmlFor="startDate">Task start date </label>
                                <input type="date" id="startDate" value={taskData.startDate} onChange={handleChange}/>
                            </div>
                            <div className="inputdiv">
                                <label className="taskinputlabel" htmlFor="dueDate">Task due date </label>
                                <input type="date" id="dueDate" value={taskData.dueDate} onChange={handleChange}/>
                            </div>
                            <div className="inputdiv">
                                <label className="taskinputlabel" htmlFor="assignee">Task assignee </label>
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
