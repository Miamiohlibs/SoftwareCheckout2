import React from 'react'

const VendorData = ({vendor, vendorGroup}) => {
  return (
    <>
    <div>VendorData: Show current checkouts and license assignments</div>
    <div>{vendor}</div>
    <div>{JSON.stringify({vendorGroup})}</div>
    </>
  )
}

export default VendorData