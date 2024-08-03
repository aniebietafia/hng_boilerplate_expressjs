import { NextFunction, Request, Response } from "express";
import { validate } from "uuid";
import { UserService } from "../services";
import { BadRequest, ResourceNotFound } from "../middleware";
import { sendJsonResponse } from "../helpers";
import asyncHandler from "../middleware/asyncHandler";

const userService = new UserService();

class UserController {
  /**
   * @swagger
   * tags:
   *  name: User
   *  description: User related routes
   */
  /**
   * @swagger
   * /api/v1/users/me:
   *  get:
   *    tags:
   *      - User
   *    summary: Get User profile
   *    security:
   *      - bearerAuth: []
   *    description: Api endpoint to retrieve the profile data of the currently authenticated user. This will allow users to access their own profile information.
   *    responses:
   *      200:
   *        description: Fetched User profile Successfully
   *        content:
   *          application/json:
   *            schema:
   *              type: object
   *              properties:
   *                status_code:
   *                  type: integer
   *                  example: 200
   *                data:
   *                  type: object
   *                  properties:
   *                    id:
   *                      type: string
   *                      example: 58b6
   *                    user_name:
   *                      type: string
   *                      example: yasuke
   *                    email:
   *                      type: string
   *                      example: sam@gmail.com
   *                    profile_picture:
   *                      type: string
   *                      example: https://avatar.com
   *
   *      401:
   *        description: Unauthorized access
   *      404:
   *        description: Not found
   *      500:
   *        description: Internal Server Error
   *
   */
  static getProfile = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.user;

    if (!id) {
      throw new BadRequest("Unauthorized! No ID provided");
    }

    if (!validate(id)) {
      throw new BadRequest("Unauthorized! Invalid User Id Format");
    }

    const user = await UserService.getUserById(id);
    if (!user) {
      throw new ResourceNotFound("User Not Found!");
    }

    if (user?.deletedAt || user?.is_deleted) {
      throw new ResourceNotFound("User not found!");
    }

    sendJsonResponse(res, 200, "User profile details retrieved successfully", {
      id: user.id,
      first_name: user?.first_name,
      last_name: user?.last_name,
      profile_id: user?.profile?.id,
      username: user?.profile?.username,
      bio: user?.profile?.bio,
      job_title: user?.profile?.jobTitle,
      language: user?.profile?.language,
      pronouns: user?.profile?.pronouns,
      department: user?.profile?.department,
      social_links: user?.profile?.social_links,
      timezones: user?.profile?.timezones,
    });
  });

  /**
   * @swagger
   * /api/v1/user/{id}:
   *  put:
   *   tags:
   *     - User
   *   summary: Update User Profile
   *   description: Update the profile of a user
   *   security:
   *     - bearerAuth: []
   *   parameters:
   *     - in: path
   *       name: id
   *       required: true
   *       schema:
   *         type: string
   *         description: The ID of the user
   *   requestBody:
   *     required: true
   *     content:
   *       multipart/form-data:
   *         schema:
   *           type: object
   *           properties:
   *             profile_pic_url:
   *               type: string
   *               format: binary
   *               description: The user's profile picture
   *       application/json:
   *         schema:
   *           type: object
   *           properties:
   *             first_name:
   *               type: string
   *               example: John
   *             last_name:
   *               type: string
   *               example: Doe
   *             phone:
   *               type: string
   *               example: 08012345678
   *             username:
   *               type: string
   *               example: johndoe
   *             jobTitle:
   *              type: string
   *              example: Software Engineer
   *             pronouns:
   *              type: string
   *              example: He/Him
   *             social_links:
   *              type: object
   *             properties:
   *              twitter:
   *               type: string
   *               example: https://twitter.com/johndoe
   *             linkedin:
   *               type: string
   *               example: https://linkedin.com/johndoe
   *   responses:
   *     200:
   *       description: User profile updated successfully
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               id:
   *                 type: string
   *                 example: 315e0834-e96d-4ddc-9974-726e8c1e9cf9
   *               name:
   *                 type: string
   *                 example: John Doe
   *               email:
   *                 type: string
   *                 example: johndoe@test.com
   *               google_id:
   *                 type: string
   *                 example: null
   *               isVerified:
   *                 type: boolean
   *                 example: true
   *               role:
   *                 type: string
   *                 example: user
   *               profile:
   *                 type: object
   *                 properties:
   *                   id:
   *                     type: string
   *                     example: 315e0834-e96d-4ddc-9974-726e8c1e9cf9
   *                   username:
   *                     type: string
   *                     example: johndoe
   *                   jobTitle:
   *                     type: string
   *                     example: Software Engineer
   *                   language:
   *                     type: string
   *                     example: English
   *                   profile_pic_url:
   *                     type: string
   *                     example: https://avatar.com/avatar.png
   *   400:
   *     description: Bad request
   *     content:
   *       application/json:
   *         schema:
   *           type: object
   *           properties:
   *             status:
   *               type: string
   *               example: unsuccessful
   *             status_code:
   *               type: integer
   *               example: 400
   *             message:
   *               type: string
   *               example: Valid id must be provided
   *   404:
   *     description: Not found
   *     content:
   *       application/json:
   *         schema:
   *           type: object
   *           properties:
   *             status:
   *               type: string
   *               example: unsuccessful
   *             status_code:
   *               type: integer
   *               example: 404
   *             message:
   *               type: string
   *               example: User not found
   *   500:
   *     description: Server Error
   *     content:
   *       application/json:
   *         schema:
   *           type: object
   *           properties:
   *             status:
   *               type: string
   *               example: unsuccessful
   *             status_code:
   *               type: integer
   *               example: 500
   *             message:
   *               type: string
   *               example: Internal Server Error
   */
  static updateUser = asyncHandler(async (req: Request, res: Response) => {
    const user = await userService.updateUserProfile(req.params.id, req.body, req.file);
    sendJsonResponse(res, 200, "Profile successfully updated", user);
  });
}

export { UserController };
