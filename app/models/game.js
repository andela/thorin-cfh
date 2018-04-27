import mongoose, { Schema } from 'mongoose';
import '../../config/config';

const GameSchema = new Schema(
  {
    players: {
      type: Array,
      required: true,
    },
    gameID: {
      type: String,
      required: true,
    },
    winner: {
      type: String,
      required: true,
    },
    gameStarter: {
      type: String,
      required: true,
    },
    roundsPlayed: {
      type: Number,
    }
  },
  { timestamps: { createdAt: 'playedAt' } }
);

export default mongoose.model('Game', GameSchema);
