import React from "react";
import './Gig.scss';
import { Slider } from "infinite-react-carousel";
import { useQuery } from "@tanstack/react-query";
import newRequest from "../../utils/newRequest";
import { Link, useParams, useNavigate } from "react-router-dom";
import Reviews from "../../components/reviews/Reviews";

const Gig = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));

    const { isLoading, error, data } = useQuery({
        queryKey: ['gig'],
        queryFn: () =>
            newRequest.get(`/gigs/single/${id}`)
                .then((res) => {
                    return res.data;
                })
    });
   
    const userId = data?.userId;
    const { isLoading: isLoadingUser, error: errorUser, data: dataUser } = useQuery({
        queryKey: ['user'],
        queryFn: () =>
            newRequest.get(`/users/${userId}`)
                .then((res) => {
                    return res.data;    
                }),
        enabled: !!userId,
    });

    const isOwner = currentUser?._id === userId;

    const handleEdit = () => {
        navigate(`/edit-gig/${id}`);
    };

    if (isLoading) return <div className="loading">Loading...</div>;
    if (error) return <div className="error">Something went wrong!</div>;

    return (
        <div className="gig">
            <div className="container">
                <div className="left">
                    <span className="breadcrumbs">
                        FIVERR &gt; {data.cat} &gt;
                    </span>
                    <h1>{data.title}</h1>
                    {isLoadingUser ? "Loading" : errorUser ? "Something went wrong!" : <div className="user">
                        <img
                            className="pp"
                            src={dataUser?.img || "/images/noavatar.jpg"}
                            alt=""
                        />
                        <span>{dataUser?.username}</span>
                        {!isNaN(dataUser?.totalStars / dataUser?.starNumber) && (
                            <div className="stars">
                                {Array(Math.round(dataUser?.totalStars / dataUser?.starNumber))
                                    .fill()
                                    .map((item, i) => (
                                        <img src="/images/star.png" alt="" key={i} />
                                    ))}
                                <span>{Math.round(dataUser?.totalStars / dataUser?.starNumber)}</span>
                            </div>
                        )}
                    </div>}
                    <Slider slidesToShow={1} arrowsScroll={1} className="slider">
                        {data.images.map((img) => (
                            <img key={img} src={img} alt="" />
                        ))}
                    </Slider>
                    <h2>About This Gig</h2>
                    <p>{data.desc}</p>
                    {isLoadingUser ? "Loading" : errorUser ? "Something went wrong!" : <div className="seller">
                        <h2>About The Seller</h2>
                        <div className="user">
                            <img
                                src={dataUser?.img || "/images/noavatar.jpg"}
                                alt=""
                            />
                            <div className="info">
                                <span>{dataUser?.username}</span>
                                {!isNaN(dataUser?.totalStars / dataUser?.starNumber) && (
                                    <div className="stars">
                                        {Array(Math.round(dataUser?.totalStars / dataUser?.starNumber))
                                            .fill()
                                            .map((item, i) => (
                                                <img src="/images/star.png" alt="" key={i} />
                                            ))}
                                        <span>
                                            {Math.round(dataUser?.totalStars / dataUser?.starNumber)}!
                                        </span>
                                    </div>
                                )}
                                <button>Contact Me</button>
                            </div>
                        </div>
                        <div className="box">
                            <div className="items">
                                <div className="item">
                                    <span className="title">From</span>
                                    <span className="desc">{dataUser?.country}</span>
                                </div>
                                <div className="item">
                                    <span className="title">Member since</span>
                                    <span className="desc">March 2025</span>
                                </div>
                                <div className="item">
                                    <span className="title">Avg. response time</span>
                                    <span className="desc">4 hours</span>
                                </div>
                                <div className="item">
                                    <span className="title">Last delivery</span>
                                    <span className="desc">about 10 hours</span>
                                </div>
                                <div className="item">
                                    <span className="title">Languages</span>
                                    <span className="desc">English</span>
                                </div>
                            </div>
                            <hr />
                            <p>{dataUser?.desc}</p>
                        </div>
                    </div>}
                    <Reviews gigId={id} />
                </div>
                <div className="right">
                    <div className="price">
                        <h3>{data.sortTitle}</h3>
                        <h2>&#x20B9;{data.price}</h2>
                    </div>
                    <p>{data.sortDesc}</p>
                    <div className="details">
                        <div className="item">
                            <img src="/images/clock.png" alt="" />
                            <span>{data.deliveryTime} days Delivery</span>
                        </div>
                        <div className="item">
                            <img src="/images/recycle.png" alt="" />
                            <span>{data.rivisonNumber} Revisions</span>
                        </div>
                    </div>
                    <div className="features">
                        {data.features.map((feature) =>
                            <div className="item" key={feature}>
                                <img src="/images/greencheck.png" alt="" />
                                <span>{feature} </span>
                            </div>)}
                    </div>
                    {isOwner ? (
                        <button onClick={handleEdit} className="edit-button">Edit Gig</button>
                    ) : (
                        <Link to={`/pay/${id}`}>
                            <button class= "btn">Continue</button>
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Gig;