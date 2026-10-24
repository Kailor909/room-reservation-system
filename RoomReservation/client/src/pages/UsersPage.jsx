import { useEffect, useState } from 'react';
import api from '../api';

function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get('/users')
      .then((res) => {
        setUsers(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError('Nepavyko gauti vartotojų sąrašo.');
        setLoading(false);
      });
  }, []);

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Vartotojai</h2>
        <span className="badge bg-secondary fs-6">
          Iš viso vartotojų: {users.length}
        </span>
      </div>

      {loading && (
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Kraunama...</span>
        </div>
      )}

      {error && <div className="alert alert-danger">{error}</div>}

      {!loading && !error && (
        <div className="card shadow-sm border-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th scope="col" style={{ width: '80px' }}>ID</th>
                  <th scope="col">Vardas ir Pavardė</th>
                  <th scope="col" className="text-center">Aktyvios rezervacijos</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="text-center py-4 text-muted">
                      Vartotojų duomenų bazėje nerasta.
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id}>
                      <td className="text-muted fw-semibold">#{user.id}</td>
                      <td>
                        <strong>{user.firstName} {user.lastName}</strong>
                      </td>
                      <td className="text-center">
                        <span
                          className={`badge rounded-pill ${
                            user.activeReservationCount > 0
                              ? 'bg-primary'
                              : 'bg-light text-muted border'
                          }`}
                        >
                          {user.activeReservationCount} aktyvi(-ios)
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default UsersPage;