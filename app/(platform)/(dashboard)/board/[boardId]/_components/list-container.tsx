"use client";

import { toast } from "sonner";
import { useEffect, useState } from "react";
import { DragDropContext, Droppable } from "@hello-pangea/dnd";

import { ListWithCards } from "@/types";

import { ListForm } from "./list-form";
import { ListItem } from "./list_item";

import { useAction } from "@/hooks/use-action";
import { updateListOrder } from "@/actions/update-list-order";
import { updateCardOrder } from "@/actions/update-card-order";

import Link from "next/link";

interface ListContainerProps {
  data: ListWithCards[];
  boardId: string;
}

function reorder<T>(list: T[], startIndex: number, endIndex: number) {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
}

export const ListContainer = ({ data, boardId }: ListContainerProps) => {
  const [orderedData, setOrderedData] = useState(data);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const { execute: executeUpdateListOrder } = useAction(updateListOrder, {
    onSuccess: () => {
      toast.success("List reordered");
    },
    onError: (error) => {
      toast.error(error);
    },
  });

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    
    if (!comment.trim()) {
      toast.error("Please enter a question");
      return;
    }

    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ comment, boardId }),
      });

      if (response.ok) {
        toast.success("Question submitted successfully");
        getComments();
        setComment("");
      } else {
        toast.error("Failed to submit question");
      }
    } catch (error) {
      toast.error("Failed to submit question");
    }
  };

  const { execute: executeUpdateCardOrder } = useAction(updateCardOrder, {
    onSuccess: () => {
      toast.success("Card reordered");
    },
    onError: (error) => {
      toast.error(error);
    },
  });

  const getComments = async () => {
    const data = await fetch(`/api/comments?boardId=${boardId}`, {
      method: 'GET',
    });

    const comments = await data.json();
    setComments(comments);
  }

  useEffect(() => {
    getComments();
    setOrderedData(data);
    
    // Check authentication via API since cookie is httpOnly
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/profile');
        setIsAuthenticated(response.ok);
      } catch {
        setIsAuthenticated(false);
      }
    };
    checkAuth();
  }, [data]);

  const onDragEnd = (result: any) => {
    if (isAuthenticated) {

      const { destination, source, type } = result;

      if (!destination) {
        return;
      }

      // if dropped in the same position
      if (
        destination.droppableId === source.droppableId &&
        destination.index === source.index
      ) {
        return;
      }

      // User moves a list
      if (type === "list") {
        const items = reorder(orderedData, source.index, destination.index).map(
          (item, index) => ({ ...item, order: index })
        );

        setOrderedData(items);
        executeUpdateListOrder({ items, boardId });
      }

      // User moves a card
      if (type === "card") {
        let newOrderedData = [...orderedData];

        // Source and destination list
        const sourceList = newOrderedData.find(
          (list) => list.id === source.droppableId
        );
        const destList = newOrderedData.find(
          (list) => list.id === destination.droppableId
        );

        if (!sourceList || !destList) {
          return;
        }

        // Check if cards exists on the sourceList
        if (!sourceList.cards) {
          sourceList.cards = [];
        }

        // Check if cards exists on the destList
        if (!destList.cards) {
          destList.cards = [];
        }

        // Moving the card in the same list
        if (source.droppableId === destination.droppableId) {
          const reorderedCards = reorder(
            sourceList.cards,
            source.index,
            destination.index
          );

          reorderedCards.forEach((card, idx) => {
            card.order = idx;
          });

          sourceList.cards = reorderedCards;

          setOrderedData(newOrderedData);
          executeUpdateCardOrder({
            boardId: boardId,
            items: reorderedCards,
          });
          // User moves the card to another list
        } else {
          // Remove card from the source list
          const [movedCard] = sourceList.cards.splice(source.index, 1);

          // Assign the new listId to the moved card
          movedCard.listId = destination.droppableId;

          // Add card to the destination list
          destList.cards.splice(destination.index, 0, movedCard);

          sourceList.cards.forEach((card, idx) => {
            card.order = idx;
          });

          // Update the order for each card in the destination list
          destList.cards.forEach((card, idx) => {
            card.order = idx;
          });

          setOrderedData(newOrderedData);
          executeUpdateCardOrder({
            boardId: boardId,
            items: destList.cards,
          });
        }
      }
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="lists" type="list" direction="horizontal">
        {(provided) => (
          <ol
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="flex gap-x-3 h-full"
          >
            {orderedData.map((list, index) => {
              return <ListItem key={list.id} index={index} data={list} />;
            })}
            {provided.placeholder}
            {isAuthenticated &&
              <ListForm />
            }
            <div className="flex-shrink-0 w-1" />
          </ol>
        )}
      </Droppable>

      {/* Questions Section */}
      <div className="bg-white mb-4 p-4 rounded-lg shadow-md mt-4 max-w-2xl">
        <h3 className="font-semibold mb-3 text-xl flex items-center gap-2">
          <span>💬</span> Questions & Discussion
        </h3>
        {comments.length === 0 ? (
          <p className="text-gray-500 text-sm py-4 text-center">No questions yet. Be the first to ask!</p>
        ) : (
          <ul className="space-y-3 max-h-64 overflow-y-auto">
            {comments.map((comment: any) => (
              <li className="border border-gray-200 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition" key={comment.id}>
                <p className="text-gray-800">{comment.text}</p>
                <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                  <span className="font-medium">— {comment.name}</span>
                  {comment.createdAt && (
                    <span>{new Date(comment.createdAt).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      
      {/* Question Form */}
      {isAuthenticated ? (
        <form onSubmit={handleSubmit} className="bg-white p-4 rounded-lg shadow-md flex flex-col sm:flex-row gap-2 w-full max-w-2xl">
          <input 
            placeholder="Ask a question about this board..." 
            className="flex-1 border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
            type="text" 
            name="comment" 
            value={comment} 
            onChange={(e) => setComment(e.target.value)} 
          />
          <button 
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors whitespace-nowrap" 
            type="submit"
          >
            Submit Question
          </button>
        </form>
      ) : (
        <div className="max-w-2xl">
          <p className="bg-white p-4 rounded-lg shadow-md text-gray-600 italic">
            Please log in to submit questions.{" "}
            <Link href="/login" className="text-blue-500 not-italic font-medium hover:underline">
              Login
            </Link>
          </p>
        </div>
      )}
    </DragDropContext>
  );
};
