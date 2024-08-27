'use client'
import {React, useState} from 'react'
import VendorGroupsList from './VendorGroupsList';
import ClickMe from './ClickMe';
// import VendorName from './VendorName';

import appConf from '../../../../config/appConf'
import VendorData from './VendorData';
const LicenseGroup = require('../../../../helpers/LicenseGroup');
const lg = new LicenseGroup(appConf);
let vendors = lg.getActiveVendors();

const VendorList = () => {
    const [selectedVendor, setSelectedVendor] = useState('');
    const [selectedVendorGroup, setSelectedVendorGroup] = useState('');
    const [vendorSelected, setVendorSelected] = useState(false);

    const handleVendorClick = (vendor, vendorGroup) => {
        setSelectedVendor(vendor);
        setSelectedVendorGroup(vendorGroup);
        setVendorSelected(true);
    }

  return (
    <>
        <h2>Vendors</h2>
        <div className='cards'>
        {vendors.map((vendor, index) => (
            
                <div className='card' key={index}>
                    <div className='card-body'>
                        <div className='card-title'>{vendor}</div>
                        <VendorGroupsList vendor={vendor} handleVendorClick={handleVendorClick} selectedVendorGroup={selectedVendorGroup}/>
                    </div>                
                </div>
            
        ))}
        </div>
        {vendorSelected && <VendorData vendor={selectedVendor} vendorGroup={selectedVendorGroup} />}  

    </>

  )
}

export default VendorList