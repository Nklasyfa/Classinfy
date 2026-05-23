const { Prodi, Matkul } = require('../../models');

exports.getProdis = async (req, res) => {
  try {
    const prodis = await Prodi.findAll();
    res.json({ data: prodis });
  } catch(e) { res.status(500).json({ error: e.message }); }
}

exports.createProdi = async (req, res) => {
  try {
    const prodi = await Prodi.create(req.body);
    res.status(201).json({ data: prodi });
  } catch(e) { res.status(500).json({ error: e.message }); }
}

exports.updateProdi = async (req, res) => {
  try {
    const prodi = await Prodi.findByPk(req.params.id);
    if (!prodi) return res.status(404).json({ message: 'Not found' });
    await prodi.update(req.body);
    res.json({ message: 'Success' });
  } catch(e) { res.status(500).json({ error: e.message }); }
}

exports.deleteProdi = async (req, res) => {
  try {
    const prodi = await Prodi.findByPk(req.params.id);
    if (!prodi) return res.status(404).json({ message: 'Not found' });
    await prodi.destroy();
    res.json({ message: 'Success' });
  } catch(e) { res.status(500).json({ error: e.message }); }
}

exports.getMatkuls = async (req, res) => {
  try {
    const matkuls = await Matkul.findAll({ include: ['prodi'] });
    res.json({ data: matkuls });
  } catch(e) { res.status(500).json({ error: e.message }); }
}

exports.createMatkul = async (req, res) => {
  try {
    const matkul = await Matkul.create(req.body);
    res.status(201).json({ data: matkul });
  } catch(e) { res.status(500).json({ error: e.message }); }
}

exports.updateMatkul = async (req, res) => {
  try {
    const matkul = await Matkul.findByPk(req.params.id);
    if (!matkul) return res.status(404).json({ message: 'Not found' });
    await matkul.update(req.body);
    res.json({ message: 'Success' });
  } catch(e) { res.status(500).json({ error: e.message }); }
}

exports.deleteMatkul = async (req, res) => {
  try {
    const matkul = await Matkul.findByPk(req.params.id);
    if (!matkul) return res.status(404).json({ message: 'Not found' });
    await matkul.destroy();
    res.json({ message: 'Success' });
  } catch(e) { res.status(500).json({ error: e.message }); }
}

exports.getKelas = async (req, res) => {
  try {
    const { Kelas } = require('../../models');
    const kelasList = await Kelas.findAll({ include: ['prodi'] });
    res.json({ data: kelasList });
  } catch(e) { res.status(500).json({ error: e.message }); }
}

exports.createKelas = async (req, res) => {
  try {
    const { Kelas } = require('../../models');
    const kelas = await Kelas.create(req.body);
    res.status(201).json({ data: kelas });
  } catch(e) { res.status(500).json({ error: e.message }); }
}

exports.updateKelas = async (req, res) => {
  try {
    const { Kelas } = require('../../models');
    const kelas = await Kelas.findByPk(req.params.id);
    if (!kelas) return res.status(404).json({ message: 'Not found' });
    await kelas.update(req.body);
    res.json({ message: 'Success' });
  } catch(e) { res.status(500).json({ error: e.message }); }
}

exports.deleteKelas = async (req, res) => {
  try {
    const { Kelas } = require('../../models');
    const kelas = await Kelas.findByPk(req.params.id);
    if (!kelas) return res.status(404).json({ message: 'Not found' });
    await kelas.destroy();
    res.json({ message: 'Success' });
  } catch(e) { res.status(500).json({ error: e.message }); }
}
