import React, { useEffect, useState } from "react";
import './message.scss';
import { Link, useParams } from "react-router-dom";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import newRequest from "../../utils/newRequest";
import moment from 'moment';

const Message = () => {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const [timeAgo, setTimeAgo] = useState({});

  const { isLoading, error, data } = useQuery({
    queryKey: ["messages", id],
    queryFn: () =>
      newRequest.get(`/messages/${id}`).then((res) => {
        return res.data;
      }),
    refetchInterval: 5000, // Refetch every 5 seconds
  });

  const { data: currentUserData } = useQuery({
    queryKey: ["seller"],
    queryFn: () =>
      newRequest.get(`/users/${currentUser._id}`).then((res) => {
        return res.data;
      }),
  });

  const { data: conversationData, isLoading: isLoadingConversation } = useQuery({
    queryKey: ["conversation", id],
    queryFn: () =>
      newRequest.get(`/conversations/${id}`).then((res) => {
        return res.data;
      }),
  });

  const mutation = useMutation({
    mutationFn: (message) => {
      return newRequest.post(`/messages`, message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["messages"]);
    },
  });

  // Update time ago every minute
  useEffect(() => {
    const updateTimeAgo = () => {
      if (data) {
        const newTimeAgo = {};
        data.forEach((message) => {
          newTimeAgo[message._id] = moment(message.createdAt).fromNow();
        });
        setTimeAgo(newTimeAgo);
      }
    };

    updateTimeAgo();
    const interval = setInterval(updateTimeAgo, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [data]);

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate({
      conversationId: id,
      desc: e.target[0].value,
    });
    e.target[0].value = "";
  };

  // Get the other user's name from the conversation data
  const otherUserName = conversationData?.otherUser?.username || 'Loading...';

  return (
    <div className="message">
      <div className="container">
        <span className="breadcrumbs">
          <Link to='/messages' className="link">MESSAGES</Link> &gt; {otherUserName}
        </span>
        {isLoading ? (
          <div className="loading">Loading messages...</div>
        ) : error ? (
          <div className="error">Something went wrong</div>
        ) : (
          <div className="messages">
            {data.map((m) => (
              <div className={m.userId === currentUser._id ? "owner item" : "item"} key={m._id}>
                <div className="message-content">
                  <img
                    src={m.userId === currentUser._id ? currentUserData?.img || '/images/noavtar.jpeg' : conversationData?.otherUser?.img || '/images/noavtar.jpeg'}
                    alt=""
                    className="avatar"
                  />
                  <div className="message-details">
                    <p className="message-text">{m.desc}</p>
                    <span className="message-time">{timeAgo[m._id] || moment(m.createdAt).fromNow()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        <hr />
        <form className="write" onSubmit={handleSubmit}>
          <textarea name="" id="" placeholder="write a message" cols="30" rows="10"></textarea>
          <button type="submit">Send</button>
        </form>
      </div>
    </div>
  );
}

export default Message;