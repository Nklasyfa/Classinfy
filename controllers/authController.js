exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Data dummy simulasi database
    const newUser = {
      id: 1,
      username: username || 'user_dummy',
      email: email || 'dummy@kampus.com',
    };
    
    res.status(201).json({
      message: 'Registrasi berhasil (Data Dummy)',
      data: newUser
    });
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Dummy login (simulasi)
    if (email === 'admin@kampus.com' && password === 'admin123') {
      res.status(200).json({
        message: 'Login berhasil (Data Dummy)',
        token: 'token_dummy_ab1234cde'
      });
    } else {
      res.status(401).json({ message: 'Email atau password salah' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};
