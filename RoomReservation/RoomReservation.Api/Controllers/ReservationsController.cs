using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RoomReservation.Api.Data;
using RoomReservation.Api.DTOs;
using RoomReservation.Api.Entities;

namespace RoomReservation.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ReservationsController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly int _maxDurationDays;
        private readonly int _maxBookingHorizonDays;

        public ReservationsController(AppDbContext context, IConfiguration configuration)
        {
            _context = context;
            _maxDurationDays = configuration.GetValue<int>("BookingRules:MaxDurationDays", 7);
            _maxBookingHorizonDays = configuration.GetValue<int>("BookingRules:MaxBookingHorizonDays", 90);
        }

        [HttpGet]
        public async Task<ActionResult<List<Reservation>>> GetReservations()
        {
            var reservations = await _context.Reservations
                .Include(r => r.Room)
                .Include(r => r.User)
                .OrderByDescending(r => r.StartDate)
                .ToListAsync();

            return Ok(reservations);
        }

        [HttpPost]
        public async Task<IActionResult> CreateReservation([FromBody] CreateReservationDto dto)
        {
            // Bazinė logikos patikra
            if (dto.EndDate <= dto.StartDate)
            {
                return BadRequest(new { code = "INVALID_RANGE", message = "Pabaigos laikas turi būti vėlesnis už pradžios laiką." });
            }

            // R4: Valid time range (Pradžia turi būti ateityje)
            if (dto.StartDate <= DateTime.UtcNow)
            {
                return BadRequest(new { code = "R4", message = "Rezervacijos pradžia privalo būti ateityje." });
            }

            // R1: Maximum duration (Iki 7 dienų, imtinai)
            if ((dto.EndDate - dto.StartDate).TotalDays > _maxDurationDays)
            {
                return BadRequest(new { code = "R1", message = $"Rezervacija negali trukti ilgiau nei {_maxDurationDays} d." });
            }

            // R6: Booking horizon (Ne daugiau kaip 90 dienų į priekį)
            if (dto.StartDate > DateTime.UtcNow.AddDays(_maxBookingHorizonDays))
            {
                return BadRequest(new { code = "R6", message = $"Rezervacija negali prasidėti vėliau nei po {_maxBookingHorizonDays} d." });
            }

            // Kambario patikra
            var room = await _context.Rooms.FindAsync(dto.RoomId);
            if (room == null)
            {
                return NotFound(new { code = "ROOM_NOT_FOUND", message = $"Kambarys #{dto.RoomId} neegzistuoja." });
            }

            // R7: Active rooms only (Tik aktyvūs kambariai)
            if (!room.IsActive)
            {
                return BadRequest(new { code = "R7", message = "Šis kambarys yra neaktyvus (pvz., vyksta remontas) ir negali būti rezervuojamas." });
            }

            // R5: Capacity (Dalyvių skaičius neviršija talpos)
            if (dto.AttendeesCount > room.Capacity)
            {
                return BadRequest(new { code = "R5", message = $"Dalyvių skaičius ({dto.AttendeesCount}) viršija kambario talpą ({room.Capacity} asm.)." });
            }

            // Vartotojo patikra
            var userExists = await _context.Users.AnyAsync(u => u.Id == dto.UserId);
            if (!userExists)
            {
                return NotFound(new { code = "USER_NOT_FOUND", message = $"Vartotojas #{dto.UserId} neegzistuoja." });
            }

            // R2: No overlapping room bookings (Kambarys negali turėti dviejų aktyvių rezervacijų tuo pačiu metu)
            var roomConflict = await _context.Reservations.AnyAsync(r =>
                r.RoomId == dto.RoomId &&
                r.Status == ReservationStatus.Booked &&
                dto.StartDate < r.EndDate &&
                dto.EndDate > r.StartDate);

            if (roomConflict)
            {
                return BadRequest(new { code = "R2", message = "Šiuo pasirinktu laiku kambarys jau yra rezervuotas." });
            }

            // R3: No overlapping organizer bookings (Tas pats vartotojas negali organizuoti persidengiančių susitikimų)
            var userConflict = await _context.Reservations.AnyAsync(r =>
                r.UserId == dto.UserId &&
                r.Status == ReservationStatus.Booked &&
                dto.StartDate < r.EndDate &&
                dto.EndDate > r.StartDate);

            if (userConflict)
            {
                return BadRequest(new { code = "R3", message = "Organizatorius tuo pačiu metu jau turi kitą aktyvią rezervaciją." });
            }

            // Sukuriame rezervaciją
            var reservation = new Reservation
            {
                RoomId = dto.RoomId,
                UserId = dto.UserId,
                Title = dto.Title,
                StartDate = dto.StartDate,
                EndDate = dto.EndDate,
                AttendeesCount = dto.AttendeesCount,
                Status = ReservationStatus.Booked
            };

            _context.Reservations.Add(reservation);
            await _context.SaveChangesAsync();

            // Užkrauname susijusius duomenis atsakymui
            await _context.Entry(reservation).Reference(r => r.Room).LoadAsync();
            await _context.Entry(reservation).Reference(r => r.User).LoadAsync();

            return Ok(reservation);
        }

        [HttpPut("{id}/cancel")]
        public async Task<IActionResult> CancelReservation(int id)
        {
            var reservation = await _context.Reservations.FindAsync(id);
            if (reservation == null)
            {
                return NotFound(new { code = "NOT_FOUND", message = $"Rezervacija #{id} nerasta." });
            }

            if (reservation.Status != ReservationStatus.Booked)
            {
                return BadRequest(new { code = "INVALID_STATUS", message = "Galima atšaukti tik aktyvias (Booked) rezervacijas." });
            }

            reservation.Status = ReservationStatus.Cancelled;
            await _context.SaveChangesAsync();

            return Ok(reservation);
        }

        [HttpPut("{id}/end-early")]
        public async Task<IActionResult> EndEarly(int id)
        {
            var reservation = await _context.Reservations.FindAsync(id);
            if (reservation == null)
            {
                return NotFound(new { code = "NOT_FOUND", message = $"Rezervacija #{id} nerasta." });
            }

            if (reservation.Status != ReservationStatus.Booked)
            {
                return BadRequest(new { code = "INVALID_STATUS", message = "Baigti anksčiau galima tik šiuo metu vykstančią aktyvią rezervaciją." });
            }

            // Nustatome pabaigą į esamąjį laiką ir pažymime Completed
            reservation.EndDate = DateTime.UtcNow;
            reservation.Status = ReservationStatus.Completed;
            await _context.SaveChangesAsync();

            return Ok(reservation);
        }
    }
}