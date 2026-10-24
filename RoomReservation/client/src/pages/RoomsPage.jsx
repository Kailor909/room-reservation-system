import { useEffect, useState } from 'react';
import api from '../api';

function RoomsPage() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [minCapacity, setMinCapacity] = useState('');
  const [selectedFloor, setSelectedFloor] = useState('all');
  const [selectedEquipment, setSelectedEquipment] = useState([]);

  const equipmentOptions = ['Projector', 'TV screen', 'Video conferencing', 'Whiteboard'];

  useEffect(() => {
    api.get('/rooms')
      .then((res) => {
        setRooms(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError('Nepavyko gauti kambarių sąrašo.');
        setLoading(false);
      });
  }, []);

  const handleEquipmentChange = (item) => {
    setSelectedEquipment((prev) =>
      prev.includes(item) ? prev.filter((e) => e !== item) : [...prev, item]
    );
  };

  const filteredRooms = rooms.filter((room) => {
    if (minCapacity && room.capacity < Number(minCapacity)) return false;
    if (selectedFloor !== 'all' && room.floor !== Number(selectedFloor)) return false;
    if (selectedEquipment.length > 0) {
      const hasAllSelected = selectedEquipment.every((eq) =>
        room.equipment && room.equipment.includes(eq)
      );
      if (!hasAllSelected) return false;
    }
    return true;
  });

  return (
    <div>
      <h2 className="mb-4">Posėdžių kambariai</h2>

      <div className="card mb-4 bg-light border-0 shadow-sm">
        <div className="card-body">
          <h5 className="card-title h6 mb-3">Filtruoti kambarius</h5>
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label">Minimali talpa (asm.):</label>
              <input
                type="number"
                className="form-control"
                placeholder="Pvz. 5"
                value={minCapacity}
                onChange={(e) => setMinCapacity(e.target.value)}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">Aukštas:</label>
              <select
                className="form-select"
                value={selectedFloor}
                onChange={(e) => setSelectedFloor(e.target.value)}
              >
                <option value="all">Visi aukštai</option>
                <option value="1">1 aukštas</option>
                <option value="2">2 aukštas</option>
                <option value="3">3 aukštas</option>
              </select>
            </div>
            <div className="col-md-12">
              <label className="form-label d-block">Įranga:</label>
              <div className="d-flex flex-wrap gap-3">
                {equipmentOptions.map((item) => (
                  <div className="form-check" key={item}>
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id={`eq-${item}`}
                      checked={selectedEquipment.includes(item)}
                      onChange={() => handleEquipmentChange(item)}
                    />
                    <label className="form-check-label" htmlFor={`eq-${item}`}>
                      {item}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {loading && <div className="spinner-border text-primary" role="status"></div>}
      {error && <div className="alert alert-danger">{error}</div>}

      {!loading && !error && (
        <div className="row g-3">
          {filteredRooms.length === 0 ? (
            <p className="text-muted">Pagal pasirinktus filtrus kambarių nerasta.</p>
          ) : (
            filteredRooms.map((room) => (
              <div key={room.id} className="col-12 col-md-6 col-lg-4">
                <div className={`card h-100 shadow-sm border-${room.isActive ? 'primary' : 'secondary'}`}>
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h5 className="card-title mb-0">{room.name}</h5>
                      <span className={`badge ${room.isActive ? 'bg-success' : 'bg-secondary'}`}>
                        {room.isActive ? 'Aktyvus' : 'Neaktyvus'}
                      </span>
                    </div>
                    <p className="card-text text-muted small mb-2">ID: #{room.id} | {room.floor} aukštas</p>
                    <p className="card-text mb-2">
                      Talpa: <strong>{room.capacity}</strong> asm.
                    </p>
                    <div>
                      <small className="text-muted d-block mb-1">Įranga:</small>
                      {room.equipment && room.equipment.length > 0 ? (
                        <div className="d-flex flex-wrap gap-1">
                          {room.equipment.map((eq) => (
                            <span key={eq} className="badge bg-light text-dark border">
                              {eq}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <small className="text-muted">Nėra papildomos įrangos</small>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default RoomsPage;