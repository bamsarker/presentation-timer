import React from 'react'

const arrow = (direction) => {
    return ({
        up: '+',
        down: '-'
    })[direction]
}

export default (props) => {
    return (
        <button className="arrowButton" onClick={props.onClick}>
            {arrow(props.direction)}
            </button>
    )
}