router.get('/vendors', async (req, res) => {
  let vendors = await vendor.getAllVendors();
  res.send(vendors);
});
