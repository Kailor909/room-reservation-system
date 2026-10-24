import { useEffect, useState } from 'react';
import api from '../api';

function ReservationsPage() {
  const [reservations, setReservations] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Formos laukai
  const [formData, setFormData] = useState({
    title: '',
    roomId: '',
    userId: '',
    startDate: '',
    endDate: '',
    attendeesCount: 1,
  });
  const [formError, setFormError] = useState(null);
  const [formSuccess, setFormSuccess] = useState(null);

  // Filtrai
  const [filterRoom, setFilterRoom] = useState('all');
  const [filterUser, setFilterUser] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');

  const loadData = async () => {
    try {
      const [resData, roomsData, usersData] = await Promise.all([
        api.get('/reservations'),
        api.get('/rooms'),
        api.get('/users'),
      ]);
      setReservations(resData.data);
      setRooms(roomsData.data);
      setUsers(usersData.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreateReservation = async (e) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    const payload = {
      title: formData.title,
      roomId: Number(formData.roomId),
      userId: Number(formData.userId),
      startDate: new Date(formData.startDate).toISOString(),
      endDate: new Date(formData.endDate).toISOString(),
      attendeesCount: Number(formData.attendeesCount),
    };

    try {
      await api.post('/reservations', payload);
      setFormSuccess('Rezervacija sėkmingai sukurta!');
      setFormData({
        title: '',
        roomId: '',
        userId: '',
        startDate: '',
        endDate: '',
        attendeesCount: 1,
      });
      loadData();
    } catch (err) {
      if (err.response && err.response.data) {
        const data = err.response.data;
        setFormError(`[${data.code || 'Klaida'}]: ${data.message || 'Nepavyko sukurti rezervacijos.'}`);
      } else {
        setFormError('Įvyko tinklo klaida susisiekiant su serveriu.');
      }
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Ar tikrai norite atšaukti šią rezervaciją?')) return;
    try {
      await api.put(`/reservations/${id}/cancel`);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Nepavyko atšaukti rezervacijos.');
    }
  };

  const handleEndEarly = async (id) => {
    if (!window.confirm('Ar tikrai norite baigti susitikimą dabar?')) return;
    try {
      await api.put(`/reservations/${id}/end-early`);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Nepavyko baigti susitikimo anksčiau.');
    }
  };

  // Filtravimo logika
  const filteredReservations = reservations.filter((r) => {
    if (filterRoom !== 'all' && r.roomId !== Number(filterRoom)) return false;
    if (filterUser !== 'all' && r.userId !== Number(filterUser)) return false;
    if (filterStatus !== 'all' && String(r.status) !== filterStatus) return false;
    if (filterStartDate && new Date(r.startDate) < new Date(filterStartDate)) return false;
    if (filterEndDate && new Date(r.endDate) > new Date(filterEndDate)) return false;
    return true;
  });

  const getStatusBadge = (status) => {
    // Status gali būti enum skaičius (0, 1, 2) arba tekstas ("Booked", "Completed", "Cancelled")
    if (status === 0 || status === 'Booked') return <span className="badge bg-primary">Booked</span>;
    if (status === 1 || status === 'Completed') return <span className="badge bg-success">Completed</span>;
    return <span className="badge bg-secondary">Cancelled</span>;
  };

  return (
    <div>
      <h2 className="mb-4">Rezervacijų valdymas</h2>

      {/* Sukūrimo forma */}
      <div className="card shadow-sm mb-4">
        <div className="card-header bg-primary text-white">
          <h5 className="card-title mb-0">Nauja rezervacija</h5>
        </div>
        <div className="card-body">
          {formError && <div className="alert alert-danger">{formError}</div>}
          {formSuccess && <div className="alert alert-success">{formSuccess}</div>}

          <form onSubmit={handleCreateReservation} className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Susitikimo pavadinimas:</label>
              <input
                type="text"
                name="title"
                className="form-control"
                required
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Pvz. Projekto aptarimas"
              />
            </div>

            <div className="col-md-3">
              <label className="form-label">Kambarys:</label>
              <select
                name="roomId"
                className="form-select"
                required
                value={formData.roomId}
                onChange={handleInputChange}
              >
                <option value="">Pasirinkite kambarį...</option>
                {rooms.map((room) => (
                  <option key={room.id} value={room.id}>
                    {room.name} (talpa: {room.capacity}, {room.isActive ? 'Aktyvus' : 'Neaktyvus'})
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-3">
              <label className="form-label">Organizatorius:</label>
              <select
                name="userId"
                className="form-select"
                required
                value={formData.userId}
                onChange={handleInputChange}
              >
                <option value="">Pasirinkite vartotoją...</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.firstName} {user.lastName}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-4">
              <label className="form-label">Pradžios data ir laikas:</label>
              <input
                type="datetime-local"
                name="startDate"
                className="form-control"
                required
                value={formData.startDate}
                onChange={handleInputChange}
              />
            </div>

            <div className="col-md-4">
              <label className="form-label">Pabaigos data ir laikas:</label>
              <input
                type="datetime-local"
                name="endDate"
                className="form-control"
                required
                value={formData.endDate}
                onChange={handleInputChange}
              />
            </div>

            <div className="col-md-2">
              <label className="form-label">Dalyvių skaičius:</label>
              <input
                type="number"
                name="attendeesCount"
                className="form-control"
                min="1"
                required
                value={formData.attendeesCount}
                onChange={handleInputChange}
              />
            </div>

            <div className="col-md-2 d-flex align-items-end">
              <button type="submit" className="btn btn-primary w-100">
                Rezervuoti
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Filtrų juosta */}
      <div className="card shadow-sm mb-4 bg-light border-0">
        <div className="card-body">
          <h6 className="card-title mb-3">Filtruoti rezervacijas</h6>
          <div className="row g-3">
            <div className="col-md-3">
              <label className="form-label">Kambarys:</label>
              <select
                className="form-select"
                value={filterRoom}
                onChange={(e) => setFilterRoom(e.target.value)}
              >
                <option value="all">Visi kambariai</option>
                {rooms.map((r) => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>

            <div className="col-md-3">
              <label className="form-label">Organizatorius:</label>
              <select
                className="form-select"
                value={filterUser}
                onChange={(e) => setFilterUser(e.target.value)}
              >
                <option value="all">Visi vartotojai</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>
                ))}
              </select>
            </div>

            <div className="col-md-2">
              <label className="form-label">Būsena:</label>
              <select
                className="form-select"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">Visos būsenos</option>
                <option value="0">Booked</option>
                <option value="1">Completed</option>
                <option value="2">Cancelled</option>
              </select>
            </div>

            <div className="col-md-2">
              <label className="form-label">Data nuo:</label>
              <input
                type="date"
                className="form-control"
                value={filterStartDate}
                onChange={(e) => setFilterStartDate(e.target.value)}
              />
            </div>

            <div className="col-md-2">
              <label className="form-label">Data iki:</label>
              <input
                type="date"
                className="form-control"
                value={filterEndDate}
                onChange={(e) => setFilterEndDate(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Rezervacijų lentelė */}
      {loading ? (
        <div className="spinner-border text-primary" role="status"></div>
      ) : (
        <div className="card shadow-sm border-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Kambarys</th>
                  <th>Susitikimo pavadinimas</th>
                  <th>Organizatorius</th>
                  <th>Laikotarpis</th>
                  <th>Dalyviai</th>
                  <th>Būsena</th>
                  <th className="text-end">Veiksmai</th>
                </tr>
              </thead>
              <tbody>
                {filteredReservations.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-4 text-muted">
                      Rezervacijų nerasta.
                    </td>
                  </tr>
                ) : (
                  filteredReservations.map((res) => {
                    const isBooked = res.status === 0 || res.status === 'Booked';
                    return (
                      <tr key={res.id}>
                        <td className="fw-semibold">{res.room?.name || `#${res.roomId}`}</td>
                        <td>{res.title}</td>
                        <td>{res.user ? `${res.user.firstName} ${res.user.lastName}` : `#${res.userId}`}</td>
                        <td className="small">
                          {new Date(res.startDate).toLocaleString()} —<br />
                          {new Date(res.endDate).toLocaleString()}
                        </td>
                        <td>{res.attendeesCount} asm.</td>
                        <td>{getStatusBadge(res.status)}</td>
                        <td className="text-end">
                          {isBooked && (
                            <div className="btn-group btn-group-sm">
                              <button
                                className="btn btn-outline-warning"
                                onClick={() => handleEndEarly(res.id)}
                                title="Baigti susitikimą anksčiau"
                              >
                                Baigti dabar
                              </button>
                              <button
                                className="btn btn-outline-danger"
                                onClick={() => handleCancel(res.id)}
                                title="Atšaukti rezervaciją"
                              >
                                Atšaukti
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default ReservationsPage;