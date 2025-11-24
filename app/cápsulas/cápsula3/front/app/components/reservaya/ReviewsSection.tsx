import { toast } from "sonner";
import { Star, ThumbsUp, User } from "lucide-react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Card } from "./ui/card";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Separator } from "./ui/separator";
import { useState } from "react";

interface Review {
  id: number;
  userName: string;
  userInitials: string;
  rating: number;
  date: string;
  comment: string;
  likes: number;
  userLiked?: boolean;
}

const mockReviews: Review[] = [
  {
    id: 1,
    userName: "María González",
    userInitials: "MG",
    rating: 5,
    date: "Hace 2 días",
    comment:
      "¡Excelente experiencia! La paella estaba deliciosa y el servicio fue impecable. Definitivamente volveré.",
    likes: 12,
    userLiked: false,
  },
  {
    id: 2,
    userName: "Carlos Ruiz",
    userInitials: "CR",
    rating: 4,
    date: "Hace 1 semana",
    comment:
      "Muy buen lugar, la comida es excelente. El único detalle es que hay que hacer reserva con anticipación porque siempre está lleno.",
    likes: 8,
    userLiked: false,
  },
  {
    id: 3,
    userName: "Ana Martínez",
    userInitials: "AM",
    rating: 5,
    date: "Hace 2 semanas",
    comment:
      "Me encantó todo. El ambiente es muy acogedor y la atención es de primera. Los precios son justos para la calidad que ofrecen.",
    likes: 15,
    userLiked: false,
  },
];

export function ReviewsSection({ restaurantName }: { restaurantName: string }) {
  const [reviews, setReviews] = useState<Review[]>(mockReviews);
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState("");
  const [hoveredRating, setHoveredRating] = useState(0);

  const handleSubmitReview = () => {
    if (newRating === 0) {
      toast.error("Por favor selecciona una calificación");
      return;
    }
    if (newComment.trim() === "") {
      toast.error("Por favor escribe un comentario");
      return;
    }

    const review: Review = {
      id: reviews.length + 1,
      userName: "Tú",
      userInitials: "TU",
      rating: newRating,
      date: "Ahora",
      comment: newComment,
      likes: 0,
      userLiked: false,
    };

    setReviews([review, ...reviews]);
    setNewRating(0);
    setNewComment("");
    toast.success("¡Reseña publicada exitosamente!");
  };

  const handleLike = (reviewId: number) => {
    setReviews(
      reviews.map((review) => {
        if (review.id === reviewId) {
          return {
            ...review,
            likes: review.userLiked ? review.likes - 1 : review.likes + 1,
            userLiked: !review.userLiked,
          };
        }
        return review;
      })
    );
  };

  const averageRating =
    reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

  return (
    <div className="space-y-6">
      {/* Header con estadísticas */}
      <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-6 border-2 border-orange-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-slate-800 mb-1">Reseñas y Valoraciones</h3>
            <p className="text-slate-600">
              {reviews.length} opiniones de clientes
            </p>
          </div>
          <div className="text-center">
            <div className="flex items-center gap-2 mb-1">
              <Star className="h-8 w-8 fill-amber-400 text-amber-400" />
              <span className="text-slate-800">{averageRating.toFixed(1)}</span>
            </div>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-4 w-4 ${
                    star <= Math.round(averageRating)
                      ? "fill-amber-400 text-amber-400"
                      : "text-slate-300"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Formulario para nueva reseña */}
      <Card className="p-6 border-2 border-orange-100 rounded-2xl">
        <h4 className="text-slate-800 mb-4">Comparte tu experiencia</h4>

        <div className="mb-4">
          <p className="text-slate-600 mb-2">Tu calificación</p>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setNewRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="transition-transform hover:scale-110"
              >
                <Star
                  className={`h-8 w-8 ${
                    star <= (hoveredRating || newRating)
                      ? "fill-amber-400 text-amber-400"
                      : "text-slate-300"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <p className="text-slate-600 mb-2">Tu comentario</p>
          <Textarea
            placeholder={`Cuéntanos sobre tu experiencia en ${restaurantName}...`}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="min-h-[100px] border-2 border-orange-100 focus:border-orange-300 rounded-xl"
          />
        </div>

        <Button
          onClick={handleSubmitReview}
          className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-xl h-11 shadow-lg"
        >
          Publicar Reseña
        </Button>
      </Card>

      {/* Lista de reseñas */}
      <div className="space-y-4">
        {reviews.map((review, index) => (
          <div key={review.id}>
            <Card className="p-5 border-2 border-orange-100 rounded-2xl hover:border-orange-200 transition-colors">
              <div className="flex items-start gap-4">
                <Avatar className="h-12 w-12 border-2 border-orange-200">
                  <AvatarFallback className="bg-gradient-to-br from-orange-400 to-red-400 text-white">
                    {review.userInitials}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h5 className="text-slate-800">{review.userName}</h5>
                      <p className="text-slate-500">{review.date}</p>
                    </div>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${
                            star <= review.rating
                              ? "fill-amber-400 text-amber-400"
                              : "text-slate-300"
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <p className="text-slate-700 mb-3">{review.comment}</p>

                  <button
                    onClick={() => handleLike(review.id)}
                    className={`flex items-center gap-2 text-sm transition-colors ${
                      review.userLiked
                        ? "text-orange-600"
                        : "text-slate-500 hover:text-orange-600"
                    }`}
                  >
                    <ThumbsUp
                      className={`h-4 w-4 ${
                        review.userLiked ? "fill-orange-600" : ""
                      }`}
                    />
                    <span>{review.likes > 0 && review.likes}</span>
                    <span>Útil</span>
                  </button>
                </div>
              </div>
            </Card>
            {index < reviews.length - 1 && (
              <Separator className="bg-orange-100" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
