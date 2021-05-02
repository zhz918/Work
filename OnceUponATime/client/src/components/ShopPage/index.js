import React, { useState } from 'react';
import './styles.css';
import Header from '../Header';
import Sidebar from '../Sidebar';
import { Avatar2 } from '../Avatar';
import { getAllShop, buyProduct, getShopSections, addSection, addProduct, deleteSection, deleteProduct} from "../../actions/shop";
import { checkUserType, checkSession } from "../../actions/user";

// ShopPage component
class ShopPage extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            admin: false,
        }
    }

    componentDidMount() {
        checkUserType(this)
    }

    componentWillMount () {
        checkSession(this.props.app)
    }

    render() {
        return (
            <div className='ShopPageContainer'>
                <Sidebar currUser={this.props.app.state.currentUser} app={this.props.app} />
                <div className='ShopPage'>
                    <div className="shopHeaderContainer">
                        <Header title="Shop" />
                    </div>
                    {this.state.admin ? (
                        <AdminShop app={this.props.app}/>
                    ) : (
                        <ShopSection app={this.props.app}/>
                    )}

                </div>
            </div>
        )
    }

}

// Shop Section (Admin) (Contain normal shop section)
class AdminShop extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            tab: 'adminShopBuy'
        }
    }

    openTab = (event) => {
        // console.log(this)
        // console.log(event.currentTarget.value)
        this.setState({tab: event.currentTarget.value})
        var i, shopTabButton;
        shopTabButton = document.getElementsByClassName("shopTabButton");
        for (i = 0; i < shopTabButton.length; i++) {
            shopTabButton[i].className = shopTabButton[i].className.replace(" active", "");
        }
        event.currentTarget.className += " active";
    }

    render() {
        return (
            <div>
                <div class="tab">
                    <button className="shopTabButton active" onClick={this.openTab} value={'adminShopBuy'}>Shop</button>
                    <button className="shopTabButton" onClick={this.openTab} value={'adminShopAdd'}>Add Product/Section</button>
                    <button className="shopTabButton" onClick={this.openTab} value={'adminShopRemove'}>Remove Product/Section</button>
                </div>
                {this.state.tab === 'adminShopBuy' ? (
                    <ShopSection app={this.props.app}/>
                ):(
                    this.state.tab === 'adminShopAdd' ? (
                        <ShopAdd />
                    ):(
                        <ShopRemove />
                    )
                )}
            </div>
        )
    }
}

// Shop Section
class ShopSection extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            inventory: [],
            purchase: false,
        }
    }

    componentDidMount() {
        getAllShop(this)
    }

    buy = (id) => {
        buyProduct(id, this)
    }

    render() {
        return (
            <div>
                <Avatar2 update={this.state.purchase} displayedUser={this.props.app.state.currentUser}/>
                {this.state.inventory.map((item) => {
                    return (
                        <ProductSection item={item} f={this.buy} />
                    )
                })}
            </div>
        )
    }
}

// Add product/productSection (Admin)
class ShopAdd extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            sections: [],
            addS: true
        }
    }

    componentDidMount() {
        getShopSections(this)
    }

    addP = (sname, name, points, img, type, value) => {
        addProduct(sname, name, points, img, type, value)
    }

    addS = (name, description) => {
        addSection(name, description, this)
    }

    handleChange = () => {
        this.setState({ addS: !this.state.addS });
    }

    render() {
        return (
            <div>
                {this.state.addS ? (
                    <div>
                        <button className="addNewButton" onClick={this.handleChange}>Add a new Product</button>
                        <AddSection sections={this.state.sections} onClick={this.addS} />
                    </div>
                ) : (
                    <div>
                        <button className="addNewButton" onClick={this.handleChange}>Add a new Section</button>
                        <AddProduct sections={this.state.sections} onClick={this.addP} />
                    </div>

                )}
            </div>
        )
    }
}

function AddSection(props) {
    const [name, setName] = useState('');
    const [description, setDes] = useState('');

    const onClick = () => {
        if (name && description && !props.sections.includes(name)) {
            setName('')
            setDes('')
            props.onClick(name, description);
        }else{
            alert("section already exist/ empty field")
        }
    };

    return (
        <div className="newForm">
            <h2>Add New Shop Section</h2>

            <label>Name</label>
            <input onChange={e => setName(e.target.value)} type='text' placeholder='New Product Section Name' value={name} />

            <label>Description</label>
            <textarea onChange={e => setDes(e.target.value)} type='text' placeholder='Description' value={description} />

            <button onClick={onClick}>Confirm</button>
        </div>
    )
}

function AddProduct(props) {
    const [name, setName] = useState('');
    const [file, setFile] = useState('');
    const [points, setPoints] = useState('');
    const [value, setValue] = useState('');

    const onClick = () => {
        const type = document.querySelector('#newProductType').value
        const section = document.querySelector('#ProductSection').value
        if (type && section && name && file && points) {
            if (!value){
                setValue(0)
            }
            props.onClick(section, name, points, file, type, value)
            setName('')
            setFile()
            setPoints('')
            setValue('')
        }else{
            alert("empty field")
        }
    };
    return (
        <div className="newForm">
            <h2>Add New Product</h2>

            <label>Name</label>
            <input onChange={e => setName(e.target.value)} type='text' placeholder='New Product Section Name' value={name} />

            <label>Image</label>
            <input onChange={e => setFile(e.target.files[0])} accept="image/*" type='file'/>

            <label>Points</label>
            <input onChange={e => setPoints(e.target.value)} type='number' placeholder='100' value={points} />

            <label>Value</label>
            <p>number of level add to user</p>
            <input onChange={e => setValue(e.target.value)} type='number' placeholder='0' value={value} />

            <label>Type of Product</label>
            <p>Avatar: change user avatar <br/> Level: add level to user</p>
            <select id="newProductType">
                <option value="Avatar">Avatar</option>
                <option value="Level">Level</option>
            </select>

            <label>Section</label>
            <select id="ProductSection">
                {props.sections.map((section) => {
                    return <option value={section}>{section}</option>
                })}
            </select>

            <button onClick={onClick}>Confirm</button>
        </div>
    )
}

// Remove product/productSection (Admin)
class ShopRemove extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            inventory: []
        }
    }

    componentDidMount() {
        getAllShop(this)
    }

    deleteProduct = (id) => {
        deleteProduct(id, this)
    }

    deleteSection = (name) => {
        deleteSection(name, this)
    }

    render() {
        return (
            <div>
                {this.state.inventory.map((item) => {
                    return (
                        <div>
                            <button className='deleteButton' onClick={() => this.deleteSection(item.name)} style={{float: "left", marginTop: "7px"}}>Delete</button>
                            <ProductSection item={item} f={this.deleteProduct} />
                        </div>
                    )
                })}
            </div>
        )
    }
}

// Product Section (inside shop section)
class ProductSection extends React.Component {

    render() {
        const item = this.props.item
        return (
            <div className='ProductType'>
                <h2 className='ProductTypeTitle'>{item.name}</h2>
                <div className='ProductList'>
                    {item.products.map((item) => {
                        return (
                            <Product title={item.name}
                                img={`data:${item.img.contentType};base64,
                                ${Buffer.from(item.img.data.data).toString('base64')}`}
                                price={item.points} f={() => this.props.f(item._id)} />
                        );
                    })}
                </div>
            </div>
        )
    }
}

// Products in Shop (inside Product Section)
class Product extends React.Component {

    render() {
        return (
            <div className='product_container' onClick={this.props.f}>
                <div className='ProductUpper' style={{ backgroundColor: "lightblue" }}>
                    <img src={this.props.img} alt='' />
                </div>

                <div className='ProductLower'>
                    <div className='product_title'>
                        <b>{this.props.title}</b>
                    </div>
                    <div className='product_price'>
                        <p>{this.props.price} points</p>
                    </div>
                </div>

            </div>
        )
    }
}


export default ShopPage;
