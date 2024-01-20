const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    // Define the name field with type String, required, and trimmed
    username:{
      type: String,
      required: true,
      trim: true,
    },
    // Define the email field with type String, required, and trimmed
    email: {
      type: String,
      required: true,
      trim: true,
    },

    // Define the password field with type String and required
    password: {
      type: String,
      required: true,
    },

   

    token: {
      type: String,
    },
    resetPasswordExpires: {
      type: Date,
    },

    history: [
      {
        image: {
          type: String,
        },
        disease: {
          type: String,
        },
        precautions: [
          {
            type: String,
          },
        ],
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("user", userSchema);
