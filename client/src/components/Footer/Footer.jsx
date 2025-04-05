import React from "react";
import './footer.scss';

const Footer = () => {
    return (
        <div className="footer" key="footer-main">
            <div className="container">
                <div className="top">
                    <div className="item">
                        <h2>Categories</h2>
                        {[
                            "Graphics & Design",
                            "Digital Marketing",
                            "Writing & Translation",
                            "Video & Animation",
                            "Music & Audio",
                            "Programming & Tech",
                            "Data",
                            "Business",
                            "Lifestyle",
                            "Photography",
                            "End-to-End Projects",
                            "Sitemap"
                        ].map((text, index) => (
                            <span key={`cat-${index}`}>{text}</span>
                        ))}
                    </div>
                    <div className="item">
                        <h2>About</h2>
                        {[
                            "Careers",
                            "Press & News",
                            "Partnerships",
                            "Privacy Policy",
                            "Terms of Service",
                            "Intellectual Property Claims",
                            "Investor Relations"
                        ].map((text, index) => (
                            <span key={`about-${index}`}>{text}</span>
                        ))}
                    </div>
                    <div className="item">
                        <h2>Support</h2>
                        {[
                            "Help & Support",
                            "Trust & Safety",
                            "Selling on Freelance",
                            "Buying on Freelance",
                            "Freelance Guides"
                        ].map((text, index) => (
                            <span key={`support-${index}`}>{text}</span>
                        ))}
                    </div>
                    <div className="item">
                        <h2>Community</h2>
                        {[
                            "Customer Success Stories",
                            "Community Hub",
                            "Forum",
                            "Events",
                            "Blog",
                            "Influencers",
                            "Affiliates",
                            "Podcast",
                            "Invite a Friend",
                            "Become a Seller",
                            "Community Standards"
                        ].map((text, index) => (
                            <span key={`community-${index}`}>{text}</span>
                        ))}
                    </div>
                    <div className="item">
                        <h2>More From Freelance</h2>
                        {[
                            "Freelance Enterprise",
                            "Freelance Business",
                            "Freelance Pro",
                            "Freelance Logo Maker",
                            "Get Inspired",
                            "Freelance Select",
                            "ClearVoice Content Marketing",
                            "Freelance Workspace Invoice Software",
                            "Learn Online Courses",
                            "Working Not Working"
                        ].map((text, index) => (
                            <span key={`more-${index}`}>{text}</span>
                        ))}
                    </div>
                </div>
                <hr />
                <div className="bottom">
                    <div className="left">
                        <h2>Freelance Hub!</h2>
                        <span>© Freelance International Ltd. 2025</span>
                    </div>
                    <div className="right">
                        <div className="social">
                            {[
                                { url: "https://twitter.com/", img: "/images/twitter.png" },
                                { url: "https://www.facebook.com/", img: "/images/facebook.png" },
                                { url: "https://www.linkedin.com/in/vivek-prajapati-993867266", img: "/images/linkedin.png" },
                                { url: "https://www.pinterest.com/", img: "/images/pinterest.png" },
                                { url: "https://www.instagram.com/", img: "/images/instagram.png" }
                            ].map((social, index) => (
                                <a href={social.url} key={`social-${index}`}>
                                    <img src={social.img} alt="" />
                                </a>
                            ))}
                        </div>
                        <div className="link">
                            <img src="/images/language.png" alt="" />
                            <span>English</span>
                        </div>
                        <div className="link">
                            <img src="/images/coin1.png" alt="" />
                            <span>INR</span>
                        </div>
                        <img src="/images/accessibility.png" alt="" />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Footer;
