// import React, { useState, useRef, useEffect } from "react";
// import './gigs.scss';
// import GigCard from '../../components/GigCard/GigCard'
// import { useQuery } from "@tanstack/react-query";
// import newRequest from "../../utils/newRequest";
// import { useLocation } from "react-router-dom";

// const Gigs = () => {
//     const [open, setopen] = useState(false);
//     const [sort, setsort] = useState("sales");
//     const minRef = useRef();
//     const maxRef = useRef();
//     const { search } = useLocation();
//     const { isLoading, error, data, refetch } = useQuery({
//         queryKey: ['gigs'],
//         queryFn: () =>
//             newRequest.get(`/gigs${search}&min=${minRef.current.value}&max=${maxRef.current.value}&sort=${sort}`)
//             .then((res) => {
//                     return res.data;
//              })
//     });
    
//     useEffect(() => {
//         refetch();

//     }, [refetch, sort]);
//     const resort = (type) => {
//         setsort(type);
//         setopen(false);
//     }
//     const apply = () => {
//         refetch();
//     };
    
//     return ([
//         <div className="gigs">
//             <div className="container">
//                 <span className="breadcrumbs">FIVERR &gt; GRAPHICS & DESIGN &gt;</span>
//                 <h1>design</h1>
//                 <p>Explore the boundaries of art and technology with Fiverr's AI artists</p>
//                 <div className="menu">
//                     <div className="left">
//                         <span>Budget</span>
//                         <input ref={minRef} type="number" placeholder="min" />
//                         <input ref={maxRef} type="number" placeholder="max" />
//                         <button onClick={apply}>Apply</button>
//                     </div>
//                     <div className="right">
//                         <span className="sortBy">SortBy</span>
//                         <span className="sortType">{sort === "sales" ? "Best Selling" : "Newest "}</span>
//                         <img src="/images/down.png" alt="" onClick={() => setopen(!open)} />
//                         {open &&
//                             (<div className="rightMenu">
//                                 {sort === "sales" ?
//                                     (<span onClick={() => resort('creadtedAt')}>Newest</span>)
//                                     : (<span onClick={() => resort('sales')}>Best Selling</span>)}
//                                 <span onClick={() => resort("sales")}>Popular</span>
//                             </div>)}
//                     </div>
//                 </div>
//                 <div className="cards">
//                     {isLoading
//                         ? <div className="loader"></div>
//                         : error
//                             ? <h4 style={{color:"red"}}>Something Gone Wrong</h4>
//                             : data.length === 0 ?
//                                 <h4 style={{color:"#d9480f"}}>no found</h4> :
//                                 data.map((gig) => <GigCard key={gig._id} item={gig} />)
//                     }
//                 </div>
//             </div>
//         </div>
//     ]);
// }
// export default Gigs;



//    This is my Old Code where Design Problem



import React, { useState, useRef, useEffect } from "react";
import './gigs.scss';
import GigCard from '../../components/GigCard/GigCard'
import { useQuery } from "@tanstack/react-query";
import newRequest from "../../utils/newRequest";
import { useLocation } from "react-router-dom";

const Gigs = () => {
    const [open, setopen] = useState(false);
    const [sort, setsort] = useState("sales");
    const minRef = useRef();
    const maxRef = useRef();
    const { search } = useLocation();
    
    // Parse search query from URL
    const searchParams = new URLSearchParams(search);
    const searchQuery = searchParams.get("search") || "";
    
    const { isLoading, error, data, refetch } = useQuery({
        queryKey: ['gigs', searchQuery, sort],
        queryFn: () =>
            newRequest.get(
                `/gigs?search=${searchQuery}&min=${minRef.current?.value || ""}&max=${maxRef.current?.value || ""}&sort=${sort}`
            ).then((res) => {
                return res.data;
            })
    });
    
    useEffect(() => {
        refetch();
    }, [sort, searchQuery, refetch]);

    const resort = (type) => {
        setsort(type);
        setopen(false);
    }

    const apply = () => {
        refetch();
    };
    
    // Dynamic title based on search query
    const getTitle = () => {
        return searchQuery ? searchQuery : "All Gigs Available";
    }

    return (
        <div className="gigs">
            <div className="container">
                <span className="breadcrumbs">Freelance hub &gt; GRAPHICS & DESIGN &gt;</span>
                <h1>{getTitle()}</h1>
                <p>Explore the boundaries of art and technology with Fiverr's AI artists</p>
                <div className="menu">
                    <div className="left">
                        <span>Budget</span>
                        <input ref={minRef} type="number" placeholder="min" />
                        <input ref={maxRef} type="number" placeholder="max" />
                        <button onClick={apply}>Apply</button>
                    </div>
                    <div className="right">
                        <span className="sortBy">SortBy</span>
                        <span className="sortType">
                            {sort === "sales" ? "Best Selling" : "Newest"}
                        </span>
                        <img src="/images/down.png" alt="" onClick={() => setopen(!open)} />
                        {open && (
                            <div className="rightMenu">
                                {sort === "sales" ? (
                                    <span onClick={() => resort('createdAt')}>Newest</span>
                                ) : (
                                    <span onClick={() => resort('sales')}>Best Selling</span>
                                )}
                                <span onClick={() => resort("sales")}>Popular</span>
                            </div>
                        )}
                    </div>
                </div>
                <div className="cards">
                    {isLoading
                        ? <div className="loader"></div>
                        : error
                            ? <h4 style={{color:"red"}}>Something Went Wrong</h4>
                            : data.length === 0
                                ? <h4 style={{color:"#d9480f"}}>No gigs found</h4>
                                : data.map((gig) => <GigCard key={gig._id} item={gig} />)
                    }
                </div>
            </div>
        </div>
    );
}

export default Gigs;