import React from 'react'
import './Portfolio.css'
import { Link } from "react-router-dom";


export default function Portfolio(props) {
    return (
        <section className="projects">
            <h1 id='Portfolio'>Progress</h1>
            <Link
                className="progress-block"
                to={{pathname: './RetirementDebt', state: {age: props.age, income: props.income,
                    debt: props.debt, committedMoneyObj: props.committedMoneyObj,
                    lifeHappens: props.lifeHappens, savingsGoal: props.savingsGoal, retirementContributions: props.retirementContributions}}}>
                <h3>Retirement and Debt</h3>
            </Link>
        </section>
    )
}
