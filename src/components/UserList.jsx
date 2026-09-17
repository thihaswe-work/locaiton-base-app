export default function UserList({
  users,
  locations,
  selectedUserId,
  onSelect,
  onRemove,
  onAddUser,
  newUserName,
  setNewUserName,
}) {
  return (
    <div className="team">
      <h2>Team</h2>
      <ul className="user-list">
        <li>
          <button
            className={`user-row ${selectedUserId === 'all' ? 'active' : ''}`}
            onClick={() => onSelect('all')}
          >
            <span className="avatar all">⌂</span>
            <span className="user-name">All Locations</span>
            <span className="user-count">{locations.length}</span>
          </button>
        </li>
        {users.map((user) => {
          const assigned = locations.filter((l) => l.assignedTo === user.id)
          const onSite = assigned.filter((l) => l.status === 'checkedin').length
          return (
            <li key={user.id} className="user-item">
              <button
                className={`user-row ${
                  selectedUserId === user.id ? 'active' : ''
                }`}
                onClick={() => onSelect(user.id)}
              >
                <span className="avatar" style={{ background: user.color }}>
                  {user.name.charAt(0).toUpperCase()}
                </span>
                <span className="user-name">{user.name}</span>
                {onSite > 0 && (
                  <span className="live-pill">
                    <span className="live-dot" />
                    {onSite} on site
                  </span>
                )}
                <span className="user-count">{assigned.length}</span>
              </button>
              <button
                className="user-remove"
                title="Remove user"
                aria-label={`Remove ${user.name}`}
                onClick={() => onRemove(user.id)}
              >
                ×
              </button>
            </li>
          )
        })}
      </ul>
      <form className="add-user" onSubmit={onAddUser}>
        <input
          type="text"
          placeholder="New team member"
          value={newUserName}
          onChange={(e) => setNewUserName(e.target.value)}
        />
        <button type="submit" className="btn btn-add">
          Add
        </button>
      </form>
    </div>
  )
}
