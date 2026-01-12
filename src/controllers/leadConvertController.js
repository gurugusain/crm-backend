import mongoose from "mongoose";
import Lead from "../models/Lead.js";
import Account from "../models/Account.js";
import Deal from "../models/Deal.js";

export async function convertLead(req, res, next) {
  const session = await mongoose.startSession();

  try {
    const { id } = req.params;
    const {
      createAccount = true,
      createDeal = true,
      gst,
      dealAmount = 0,
      dealTitle,
    } = req.body;

    session.startTransaction();

    const lead = await Lead.findOne({ _id: id, isDeleted: false }).session(session);
    if (!lead) {
      throw new Error("Lead not found");
    }

    let account = null;

    // ACCOUNT CREATION / REUSE
    if (createAccount) {
      if (gst) {
        account = await Account.findOne({
          companyName: lead.company,
          gst,
        }).session(session);
      }

      if (!account) {
        account = await Account.create(
          [
            {
              companyName: lead.company,
              gst,
              owner: req.user.id,
            },
          ],
          { session }
        );
        account = account[0];
      }
    }

    // DEAL CREATION
    let deal = null;
    if (createDeal) {
      if (!account) {
        throw new Error("Account required to create Deal");
      }

      deal = await Deal.create(
        [
          {
            title: dealTitle || `${lead.company} Deal`,
            amount: dealAmount,
            account: account._id,
            lead: lead._id,
            owner: req.user.id,
          },
        ],
        { session }
      );
      deal = deal[0];
    }

    // MARK LEAD AS CONVERTED
    lead.status = "CONVERTED";
    await lead.save({ session });

    await session.commitTransaction();
    session.endSession();

   return res.status(200).json({
  message: "Lead converted successfully",
  accountId: account._id.toString(),
  dealId: deal._id.toString(),
});

  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    next(err);
  }
}
