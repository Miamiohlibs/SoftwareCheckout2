module.exports = {
  nodePort: 9000,
  software: [
    {
      vendor: 'Adobe',
      libCalName: 'Adobe Photoshop', // libcal list name
      shortName: 'photoshop',
      vendorGroupName: 'Library Patron Photoshop api',
      active: true,
    },
    {
      vendor: 'Adobe',
      libCalName: 'Adobe Illustrator',
      shortName: 'illustrator',
      vendorGroupName: 'Library Patron Illustrator api',
      active: true,
    },
    {
      vendor: 'Adobe',
      libCalName: '',
      shortName: 'unsubscribed',
      vendorGroupName: '',
      active: false,
    },
    {
      vendor: 'WidgetCo',
      libCalName: 'WidgetWare',
      shortName: 'widgets',
      vendorGroupName: 'WidgetGroup',
      active: true,
    },
    {
      vendor: 'FutureCo',
      libCalName: 'FutureWare',
      shortName: 'future',
      vendorGroupName: 'SoftwareWeMightAdd',
      active: false,
    },
  ],
};
