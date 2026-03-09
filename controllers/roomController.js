exports.getAllRooms = async (req, res) => {
  try {
    // Data dummy ruangan/fasilitas dari database
    const rooms = [
      { id: 101, code: 'R-101', name: 'Ruang Seminar A', capacity: 100, status: 'available' },
      { id: 102, code: 'LAB-1', name: 'Laboratorium Komputer', capacity: 40, status: 'booked' },
      { id: 103, code: 'AUD', name: 'Auditorium Utama', capacity: 500, status: 'available' }
    ];
    
    res.status(200).json({
      message: 'Berhasil mengambil daftar fasilitas kampus (Data Dummy)',
      data: rooms
    });
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};
