import { useRef, useState } from "react";
import { useAuth } from "./contexts/AuthContext";
import api from './api';
import AsyncSelect from 'react-select/async';
import { asyncSelectStyles } from './asyncSelectTheme';

const emptyTeamForm = { name: '', description: '', members: [] };

function Sidebar({ user, onLogout }) {
	const teamDialogRef = useRef(null);
	const deleteDialogRef = useRef(null);
	const editingTeamRef = useRef(null);
	const deletingTeamRef = useRef(null);
	const { refreshUser } = useAuth();
	const teams = user?.teams || [];
	const name = user?.name || user?.username || 'No name available';
	const email = user?.email || 'No email available';
	const initials = name.split(' ').map((part) => part[0]).join('').toUpperCase();

	const [teamForm, setTeamForm] = useState(emptyTeamForm);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [isEditing, setIsEditing] = useState(false);
	const [deleteTargetName, setDeleteTargetName] = useState('');

	const loadUsers = async (input) => {
		const excluded = [
			user?._id,
			...teamForm.members.map((member) => member?.value || member?._id || member),
		];

		try {
			const { data } = await api.get('/users');
			const search = (input || '').toLowerCase();

			return data
				.filter((u) => !excluded.includes(u._id))
				.filter((u) => !search || u.username.toLowerCase().includes(search) || u.email.toLowerCase().includes(search))
				.map((u) => ({ value: u._id, label: `${u.username} (${u.email})` }));
		} catch (err) {
			console.error('Error loading users', err);
			return [];
		}
	};

	const openTeamDialog = async (mode, team = null) => {
		editingTeamRef.current = team;
		setIsEditing(mode === 'edit' && !!team);
		setTeamForm({ ...emptyTeamForm });
		setLoading(false);
		setError('');
		teamDialogRef.current?.showModal();

		if (mode !== 'edit' || !team) {
			return;
		}

		try {
			const { data } = await api.get(`/teams/${team._id}`);
			setTeamForm({
				name: data.name || '',
				description: data.description || '',
				members: (data.members || []).map((member) => {
					if (!member) return null;
					if (member.value && member.label) return member;
					const memberId = member._id || member.id || member;
					const username = member.username || member.name || 'Unknown user';
					const memberEmail = member.email ? ` (${member.email})` : '';
					return { value: memberId, label: `${username}${memberEmail}` };
				}),
			});
		} catch (err) {
			console.error('Error loading team for edit', err);
			setError(err.message || 'Error loading team');
		}
	};

	const closeTeamDialog = () => {
		teamDialogRef.current?.close();
		editingTeamRef.current = null;
		setIsEditing(false);
		setTeamForm({ ...emptyTeamForm });
		setLoading(false);
		setError('');
	};

	const setTeamField = (field, value) => {
		setTeamForm((prev) => ({
			...prev,
			[field]: value,
		}));
	};

	const handleTeamSubmit = async (e) => {
		e.preventDefault();
		if (!teamForm.name.trim()) {
			setError('Team name is required');
			return;
		}

		setLoading(true);
		setError('');
		try {
			const memberIds = teamForm.members.map((member) => member.value);
			const members = Array.from(new Set([...memberIds, user._id]));
			const payload = {
				name: teamForm.name,
				description: teamForm.description,
				members,
			};

			if (editingTeamRef.current) {
				await api.put(`/teams/${editingTeamRef.current._id}`, payload);
			} else {
				await api.post('/teams', payload);
			}

			await refreshUser();
			closeTeamDialog();
		} catch (err) {
			console.error('Error saving team', err);
			setError(err.message || 'Error saving team');
			setLoading(false);
		}
	};

	const openDeleteDialog = (team) => {
		deletingTeamRef.current = team;
		setDeleteTargetName(team?.name || '');
		setLoading(false);
		setError('');
		deleteDialogRef.current?.showModal();
	};

	const closeDeleteDialog = () => {
		deleteDialogRef.current?.close();
		deletingTeamRef.current = null;
		setDeleteTargetName('');
		setLoading(false);
		setError('');
	};

	const handleDeleteTeam = async () => {
		if (!deletingTeamRef.current) return;

		setLoading(true);
		setError('');
		try {
			await api.delete(`/teams/${deletingTeamRef.current._id}`);
			await refreshUser();
			closeDeleteDialog();
		} catch (err) {
			console.error('Error deleting team', err);
			setError(err.message || 'Error deleting team');
			setLoading(false);
		}
	};


	return (
		<aside className="sidebar">
			<div className="user-info">
				<div className="user-initials">{initials}</div>
				<div className="user-details">
					<h3>{name}</h3>
					<p>{email}</p>
				</div>
			</div>

			<div className="teams">
				<div className="teams-header">
					<h4>Teams</h4>
				</div>
				{teams.length > 0 ? (
					<div className="team-card-list">
						{teams.map((team) => {
							const memberCount = team.members.length ?? 0;
							return (
								<article key={team._id || team.id || team.name} className="team-card">
									<div className="team-card-header">
										<h5>{team.name}</h5>
										<span className="team-card-badge">
											{memberCount === null ? '' : `${memberCount} member${memberCount === 1 ? '' : 's'}`}
										</span>
									</div>
									<p className="team-card-description">{team.description || 'No description provided'}</p>
									<div className="team-card-actions">
										<button type="button" onClick={() => openTeamDialog('edit', team)}>Edit</button>
										<button type="button" className="delete-button" onClick={() => openDeleteDialog(team)}>Delete</button>
									</div>
								</article>
							);
						})}
					</div>
				) : (
					<p className="empty-state">No teams yet</p>
				)}
			</div>

			<div className="create-team">
				<button onClick={() => openTeamDialog('create')}>Create Team</button>
				<button onClick={onLogout}>Logout</button>
			</div>

			<dialog ref={teamDialogRef} className="team-dialog" closedby="any">
				<form onSubmit={handleTeamSubmit} className="team-dialog-form">
					<h3>{isEditing ? 'Edit Team' : 'Create Team'}</h3>
					{error && <div className="form-error">{error}</div>}

					<label htmlFor="teamName">Team name</label>
					<input id="teamName" type="text" placeholder="Team name" value={teamForm.name} onChange={(e) => setTeamField('name', e.target.value)} required />

					<label htmlFor="teamDescription">Description</label>
					<input id="teamDescription" type="text" placeholder="Optional description" value={teamForm.description} onChange={(e) => setTeamField('description', e.target.value)} />

					<label htmlFor="memberSearch">Add members</label>
					<AsyncSelect
						id="memberSearch"
						isDisabled={loading}
						defaultOptions
						isMulti
						isClearable
						isSearchable
						menuPortalTarget={document.getElementById('modal-root')}
						menuPlacement="auto"
						loadOptions={(input) => loadUsers(input)}
						onChange={(s) => setTeamField('members', s || [])}
						value={teamForm.members}
						styles={asyncSelectStyles}
					/>
					<div className="team-dialog-actions">
						<button type="submit" disabled={loading}>{loading ? (isEditing ? 'Saving...' : 'Creating...') : (isEditing ? 'Save Changes' : 'Create Team')}</button>
						<button type="button" onClick={closeTeamDialog} disabled={loading}>Cancel</button>
					</div>
				</form>
			</dialog>

			<dialog ref={deleteDialogRef} className="team-dialog team-dialog-small" closedby="any">
				<div className="team-dialog-form">
					<h3>Delete Team</h3>
				{error && <div className="form-error">{error}</div>}
				<p className="delete-confirmation">Are you sure you want to delete {deleteTargetName || 'this team'}?</p>
				<div className="team-dialog-actions">
					<button type="button" className="danger-button" onClick={handleDeleteTeam} disabled={loading}>{loading ? 'Deleting...' : 'Delete Team'}</button>
					<button type="button" onClick={closeDeleteDialog} disabled={loading}>Cancel</button>
					</div>
				</div>
			</dialog>
		</aside>
	);
}

export default Sidebar;
