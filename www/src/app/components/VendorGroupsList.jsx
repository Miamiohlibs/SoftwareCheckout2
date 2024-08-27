import React from 'react'
import appConf from '../../../../config/appConf'
const LicenseGroup = require('../../../../helpers/LicenseGroup');
const lg = new LicenseGroup(appConf);

const VendorGroupsList = ({vendor, handleVendorClick, selectedVendorGroup}) => {
    return (
        <ul className='list-group'>
            {lg.getLicenseGroupsByVendor(vendor, false).map((vendorGroup, index) => (
                <li className={selectedVendorGroup.libCalName === vendorGroup.libCalName ? 'list-group-item active' :  'list-group-item'}
                key={index} onClick={(e) => handleVendorClick(vendor, vendorGroup)}>
                    {vendorGroup.libCalName}
                </li>
            ))}
        </ul>
    )
}

export default VendorGroupsList