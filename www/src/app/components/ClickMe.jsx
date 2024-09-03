import React from 'react'

const ClickMe = ({text, clickHandler}) => {
  return (
    <button className='btn btn-primary' onClick={() => clickHandler('content')}>{text}</button>
  )
}

export default ClickMe