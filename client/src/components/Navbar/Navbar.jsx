import React, { useEffect, useState } from 'react';
import './navbar.scss'
import { Link, useLocation, useNavigate } from 'react-router-dom';
import newRequest from '../../utils/newRequest';

const Navbar = () => {
    const [active, setactive] = useState(false);
    const [active1, setactive1] = useState(false);
    const [open, setopen] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const { pathname } = useLocation();
    const navigate = useNavigate();
    
    // Function to update current user
    const updateCurrentUser = () => {
        const user = JSON.parse(localStorage.getItem('currentUser'));
        setCurrentUser(user);
    };

    // Listen for storage changes
    useEffect(() => {
        window.addEventListener('storage', updateCurrentUser);
        updateCurrentUser(); // Initial load
        return () => window.removeEventListener('storage', updateCurrentUser);
    }, []);

    const isActive = () => {
        window.scrollY > 0 ? setactive(true) : setactive(false);
    }
    const isActive1 = () => {
        window.scrollY > 50 ? setactive1(true) : setactive1(false);
    }
    useEffect(() => {
        window.addEventListener('scroll', isActive);
        window.addEventListener('scroll', isActive1);
        return () => {
            window.removeEventListener('scroll', isActive);
            window.removeEventListener('scroll', isActive1);
        }
    }, []);

    const handleLogout = async () => {
        try {
            await newRequest.post('/auth/logout');
            localStorage.setItem("currentUser", null);
            setCurrentUser(null);
            window.location.href = '/'; // Force a full page reload
        } catch (err) {
            console.error("Logout error:", err);
        }
    }

    const [input, setinput] = useState("");
    const handlesubmit = () => {
        navigate(`gigs?search=${input}`);
    }

    return (
        <div className={active || pathname !== "/" ? "navbar active" : "navbar "}>
            <div className="container">
                <div className="logo">
                    <Link to='/' className='link'>
                        <span className='log'>Freelance Hub</span>
                    </Link>
                    <span className='dot'>!</span>
                </div>
                {active && <div className="navbarsearch">
                    <input type="text" placeholder='what service are you looking for today?' onChange={e => setinput(e.target.value)} />
                    <div className="search">
                        <img src="/images/search.png" alt="" onClick={handlesubmit} />
                    </div>
                </div>}
                <div className="links">
                    <span onClick={()=>navigate('/becomeseller')}>fiverr Business</span>
                    <span className="tooltip">Explore
                        <span className="tooltiptext">
                            <div className="col">
                                <div className="item_tooltip">
                                    <h4 className='item_tooltip_header'>Discover</h4>
                                    <p className='item_tooltip_desc'>Inspiring projects made on Fiverr</p>
                                </div>
                                <div className="item_tooltip">
                                    <h4 className='item_tooltip_header'>Guides</h4>
                                    <p className='item_tooltip_desc'>In-depth guides covering business topics</p>
                                </div>
                                <div className="item_tooltip">
                                    <h4 className='item_tooltip_header'>Podcast</h4>
                                    <p className='item_tooltip_desc'>Inside tips from top business minds</p>
                                </div>
                                <div className='item_tooltip'>
                                    <h4 className='item_tooltip_header'>Logo Maker</h4>
                                    <p className='item_tooltip_desc'>Create your logo instantly</p>
                                </div>
                            </div>
                            <div className="col">
                                <div className="item_tooltip">
                                    <h4 className='item_tooltip_header'>Community</h4>
                                    <p className='item_tooltip_desc'>Connect with Fiverr's team and community</p>
                                </div>
                                <div className="item_tooltip">
                                    <h4 className='item_tooltip_header'>Podcast</h4>
                                    <p className='item_tooltip_desc'>Inside tips from top business minds</p>
                                </div>
                                <div className="item_tooltip">
                                    <h4 className='item_tooltip_header'>Blog</h4>
                                    <p className='item_tooltip_desc'>News, information and community stories</p>
                                </div>
                                <div className="item_tooltip">
                                    <h4 className='item_tooltip_header'>Fiverr Workspace</h4>
                                    <p className='item_tooltip_desc'>One place to manage your business</p>
                                </div>
                            </div>
                        </span>
                    </span>
                    <span>
                        <img src='/images/language.png' alt='' width={'18px'} height={'16px'}
                            style={{ marginRight: '10px' }}>
                        </img>
                        English
                    </span>
                    {!currentUser && (
                        <>
                            <Link to='/login' className='link'><span>Sign in</span></Link>
                            <button onClick={() => navigate('/register')}>Join</button>
                        </>
                    )}
                    {currentUser && !currentUser.isSeller && (
                        <span onClick={() => navigate('/becomeSeller')}>Become a Seller</span>
                    )}
                    {currentUser && currentUser.isSeller && (
                        <span onClick={() => navigate('/becomeBuyer')}>Become a Buyer</span>
                    )}
                    {currentUser && (
                        <div className="user" onClick={() => setopen(!open)}>
                            <img src={currentUser.img || '/images/noavtar.jpeg'} alt="" />
                            <span>{currentUser?.username}</span>
                            {open && (
                                <div className="options">
                                    {currentUser.isSeller && (
                                        <>
                                            <Link className='link' to='/mygigs'>Gigs</Link>
                                            <Link className='link' to='/add'>Add New Gig</Link>
                                        </>
                                    )}
                                    <Link className='link' to='/orders'>Orders</Link>
                                    <Link className='link' to='/messages'>Messages</Link>
                                    <span className='link' onClick={handleLogout}>Logout</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {(active1 || pathname !== "/") && (
                <>
                    <hr />
                    <div className="menu">
                        <Link className='link menulink' to='/'>Graphics & Design</Link>
                        <Link className='link menulink' to='/'>Video & Animation</Link>
                        <Link className='link menulink' to='/'>Writing & Translation</Link>
                        <Link className='link menulink' to='/'>AI Services</Link>
                        <Link className='link menulink' to='/'>Digital Marketing</Link>
                        <Link className='link menulink' to='/'>Music & Audio</Link>
                        <Link className='link menulink' to='/'>Programming & Tech</Link>
                        <Link className='link menulink' to='/'>Business</Link>
                        <Link className='link menulink' to='/'>Lifestyle</Link>
                    </div>
                    <hr />
                </>
            )}
        </div>
    );
}

export default Navbar;