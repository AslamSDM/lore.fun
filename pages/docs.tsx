"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronRight,
  Wallet,
  BookOpen,
  PenTool,
  Vote,
  User,
  Coins,
  Info,
  ArrowRight,
} from "lucide-react";

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState("getting-started");

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Lore.Fun Documentation</h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <div className="sticky top-8 card">
            <h2 className="text-xl font-bold mb-4">Contents</h2>
            <nav className="space-y-1">
              <button
                onClick={() => scrollToSection("getting-started")}
                className={`flex items-center w-full px-3 py-2 text-left rounded-md ${
                  activeSection === "getting-started"
                    ? "bg-primary bg-opacity-20 text-primary"
                    : "hover:bg-gray-800"
                }`}
              >
                <Info className="w-5 h-5 mr-2" />
                <span>Getting Started</span>
                {activeSection === "getting-started" && (
                  <ChevronRight className="w-4 h-4 ml-auto" />
                )}
              </button>

              <button
                onClick={() => scrollToSection("connecting-wallet")}
                className={`flex items-center w-full px-3 py-2 text-left rounded-md ${
                  activeSection === "connecting-wallet"
                    ? "bg-primary bg-opacity-20 text-primary"
                    : "hover:bg-gray-800"
                }`}
              >
                <Wallet className="w-5 h-5 mr-2" />
                <span>Connecting Your Wallet</span>
                {activeSection === "connecting-wallet" && (
                  <ChevronRight className="w-4 h-4 ml-auto" />
                )}
              </button>

              <button
                onClick={() => scrollToSection("creating-stories")}
                className={`flex items-center w-full px-3 py-2 text-left rounded-md ${
                  activeSection === "creating-stories"
                    ? "bg-primary bg-opacity-20 text-primary"
                    : "hover:bg-gray-800"
                }`}
              >
                <BookOpen className="w-5 h-5 mr-2" />
                <span>Creating Stories</span>
                {activeSection === "creating-stories" && (
                  <ChevronRight className="w-4 h-4 ml-auto" />
                )}
              </button>

              <button
                onClick={() => scrollToSection("submitting-continuations")}
                className={`flex items-center w-full px-3 py-2 text-left rounded-md ${
                  activeSection === "submitting-continuations"
                    ? "bg-primary bg-opacity-20 text-primary"
                    : "hover:bg-gray-800"
                }`}
              >
                <PenTool className="w-5 h-5 mr-2" />
                <span>Submitting Continuations</span>
                {activeSection === "submitting-continuations" && (
                  <ChevronRight className="w-4 h-4 ml-auto" />
                )}
              </button>

              <button
                onClick={() => scrollToSection("voting")}
                className={`flex items-center w-full px-3 py-2 text-left rounded-md ${
                  activeSection === "voting"
                    ? "bg-primary bg-opacity-20 text-primary"
                    : "hover:bg-gray-800"
                }`}
              >
                <Vote className="w-5 h-5 mr-2" />
                <span>Voting on Submissions</span>
                {activeSection === "voting" && (
                  <ChevronRight className="w-4 h-4 ml-auto" />
                )}
              </button>

              <button
                onClick={() => scrollToSection("profile")}
                className={`flex items-center w-full px-3 py-2 text-left rounded-md ${
                  activeSection === "profile"
                    ? "bg-primary bg-opacity-20 text-primary"
                    : "hover:bg-gray-800"
                }`}
              >
                <User className="w-5 h-5 mr-2" />
                <span>Your Profile</span>
                {activeSection === "profile" && (
                  <ChevronRight className="w-4 h-4 ml-auto" />
                )}
              </button>

              <button
                onClick={() => scrollToSection("tokens")}
                className={`flex items-center w-full px-3 py-2 text-left rounded-md ${
                  activeSection === "tokens"
                    ? "bg-primary bg-opacity-20 text-primary"
                    : "hover:bg-gray-800"
                }`}
              >
                <Coins className="w-5 h-5 mr-2" />
                <span>$LORE Tokens</span>
                {activeSection === "tokens" && (
                  <ChevronRight className="w-4 h-4 ml-auto" />
                )}
              </button>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-12">
          {/* Getting Started */}
          <section id="getting-started" className="scroll-mt-8">
            <div className="card">
              <h2 className="text-2xl font-bold mb-4 flex items-center">
                <Info className="w-6 h-6 mr-2 text-primary" />
                Getting Started with Lore.Fun
              </h2>

              <p className="mb-4">
                Welcome to Lore.Fun, a collaborative storytelling platform on
                the Solana blockchain. Our platform allows $LORE token holders
                to collectively create stories by submitting and voting on
                continuations.
              </p>

              <div className="bg-gray-800 rounded-lg p-4 mb-6">
                <h3 className="font-bold mb-2">How Lore.Fun Works:</h3>
                <ol className="list-decimal list-inside space-y-2 ml-2">
                  <li>Connect your Solana wallet to participate</li>
                  <li>Browse existing stories or create your own</li>
                  <li>Submit your continuation to an ongoing story</li>
                  <li>
                    Vote on the best continuations from other contributors
                  </li>
                  <li>The winning continuation becomes part of the story</li>
                  <li>
                    The process repeats until the story reaches completion (100
                    sentences)
                  </li>
                </ol>
              </div>

              <p className="mb-4">
                Each story evolves through a democratic process where the
                community decides the narrative direction. Every three days, a
                new sentence is added based on community votes, creating a truly
                collaborative storytelling experience.
              </p>

              <div className="flex justify-center my-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 w-full max-w-3xl">
                  <div className="bg-gray-800 p-4 rounded-lg text-center">
                    <div className="bg-primary bg-opacity-20 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
                      <Wallet className="w-6 h-6 text-primary" />
                    </div>
                    <p className="font-medium">Connect</p>
                  </div>
                  <div className="bg-gray-800 p-4 rounded-lg text-center">
                    <div className="bg-primary bg-opacity-20 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
                      <PenTool className="w-6 h-6 text-primary" />
                    </div>
                    <p className="font-medium">Submit</p>
                  </div>
                  <div className="bg-gray-800 p-4 rounded-lg text-center">
                    <div className="bg-primary bg-opacity-20 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
                      <Vote className="w-6 h-6 text-primary" />
                    </div>
                    <p className="font-medium">Vote</p>
                  </div>
                  <div className="bg-gray-800 p-4 rounded-lg text-center">
                    <div className="bg-primary bg-opacity-20 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
                      <Coins className="w-6 h-6 text-primary" />
                    </div>
                    <p className="font-medium">Earn</p>
                  </div>
                </div>
              </div>

              <p>
                Ready to start your collaborative storytelling journey? Let's
                begin by connecting your Solana wallet.
              </p>
            </div>
          </section>

          {/* Connecting Your Wallet */}
          <section id="connecting-wallet" className="scroll-mt-8">
            <div className="card">
              <h2 className="text-2xl font-bold mb-4 flex items-center">
                <Wallet className="w-6 h-6 mr-2 text-primary" />
                Connecting Your Wallet
              </h2>

              <p className="mb-4">
                To participate in Lore.Fun, you'll need to connect a Solana
                wallet. This allows you to create stories, submit continuations,
                and vote on submissions.
              </p>

              <h3 className="text-xl font-medium mb-3">
                Step 1: Get a Solana Wallet
              </h3>
              <p className="mb-4">
                If you don't already have a Solana wallet, you'll need to
                install one. We recommend one of the following:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-800 p-4 rounded-lg">
                  <h4 className="font-bold mb-2">Phantom</h4>
                  <p className="text-sm mb-3">
                    A user-friendly wallet built specifically for Solana.
                  </p>
                  <a
                    href="https://phantom.app/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline text-sm flex items-center"
                  >
                    Get Phantom <ArrowRight className="w-3 h-3 ml-1" />
                  </a>
                </div>
                <div className="bg-gray-800 p-4 rounded-lg">
                  <h4 className="font-bold mb-2">Solflare</h4>
                  <p className="text-sm mb-3">
                    A secure, non-custodial wallet for Solana.
                  </p>
                  <a
                    href="https://solflare.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline text-sm flex items-center"
                  >
                    Get Solflare <ArrowRight className="w-3 h-3 ml-1" />
                  </a>
                </div>
                <div className="bg-gray-800 p-4 rounded-lg">
                  <h4 className="font-bold mb-2">Torus</h4>
                  <p className="text-sm mb-3">
                    A wallet that lets you log in with your social accounts.
                  </p>
                  <a
                    href="https://tor.us/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline text-sm flex items-center"
                  >
                    Get Torus <ArrowRight className="w-3 h-3 ml-1" />
                  </a>
                </div>
              </div>

              <h3 className="text-xl font-medium mb-3">
                Step 2: Connect Your Wallet to Lore.Fun
              </h3>
              <p className="mb-4">
                Once you have a wallet, connecting to Lore.Fun is simple:
              </p>

              <ol className="list-decimal list-inside space-y-3 mb-6">
                <li>
                  Click the{" "}
                  <span className="bg-primary text-white px-2 py-1 rounded text-sm">
                    Connect Wallet
                  </span>{" "}
                  button in the top-right corner of the navigation bar
                </li>
                <li>Select your wallet provider from the modal that appears</li>
                <li>Approve the connection request in your wallet</li>
                <li>
                  If you're a new user, you'll be prompted to create a username
                  (this will be your identity on the platform)
                </li>
              </ol>

              <div className="bg-yellow-900 bg-opacity-30 border border-yellow-700 rounded-lg p-4 mb-6">
                <h4 className="font-bold flex items-center mb-2">
                  <Info className="w-5 h-5 mr-2" />
                  Important Note
                </h4>
                <p>
                  You'll need $LORE tokens to participate fully in the platform.
                  These tokens are used for creating stories, submitting
                  continuations, and voting. See the $LORE Tokens section for
                  more information.
                </p>
              </div>

              <h3 className="text-xl font-medium mb-3">
                Step 3: Manage Your Connection
              </h3>
              <p className="mb-4">
                Once connected, you can access your profile by clicking on your
                username in the navigation bar. From there, you can view your
                activity, submissions, and created stories.
              </p>

              <p>
                To disconnect your wallet, visit your profile page and click the
                disconnect button, or use your wallet's interface to disconnect
                from the site.
              </p>
            </div>
          </section>

          {/* Creating Stories */}
          <section id="creating-stories" className="scroll-mt-8">
            <div className="card">
              <h2 className="text-2xl font-bold mb-4 flex items-center">
                <BookOpen className="w-6 h-6 mr-2 text-primary" />
                Creating Stories
              </h2>

              <p className="mb-4">
                Creating a new story on Lore.Fun allows you to start a
                collaborative narrative from scratch. You'll set the initial
                premise and first sentence, then the community will help develop
                it.
              </p>

              <h3 className="text-xl font-medium mb-3">
                Requirements for Creating a Story
              </h3>
              <ul className="list-disc list-inside space-y-2 mb-6">
                <li>You must have a connected Solana wallet</li>
                <li>You must have sufficient $LORE tokens</li>
              </ul>

              <h3 className="text-xl font-medium mb-3">Step-by-Step Guide</h3>

              <div className="space-y-6 mb-6">
                <div className="flex">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary bg-opacity-20 rounded-full flex items-center justify-center mr-4 mt-1">
                    <span className="text-primary font-bold">1</span>
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">
                      Navigate to the Create Page
                    </h4>
                    <p>
                      Click on the "Create New Story" button on the Stories
                      page, or navigate directly to{" "}
                      <Link
                        href="/create"
                        className="text-primary hover:underline"
                      >
                        /create
                      </Link>
                      .
                    </p>
                  </div>
                </div>

                <div className="flex">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary bg-opacity-20 rounded-full flex items-center justify-center mr-4 mt-1">
                    <span className="text-primary font-bold">2</span>
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">
                      Fill in the Story Details
                    </h4>
                    <p className="mb-2">
                      Complete the form with the following information:
                    </p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>
                        <span className="font-medium">Title:</span> A compelling
                        title for your story
                      </li>
                      <li>
                        <span className="font-medium">
                          Subtitle (optional):
                        </span>{" "}
                        A brief tagline or description
                      </li>
                      <li>
                        <span className="font-medium">Genre:</span> Select the
                        most appropriate genre
                      </li>
                      <li>
                        <span className="font-medium">First Sentence:</span> The
                        opening sentence that sets the tone and direction
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="flex">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary bg-opacity-20 rounded-full flex items-center justify-center mr-4 mt-1">
                    <span className="text-primary font-bold">3</span>
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">Review Story Settings</h4>
                    <p>
                      Check the default settings for your story. These include
                      the minimum sentences for completion (100), voting period
                      (3 days), and submission period (12 hours).
                    </p>
                  </div>
                </div>

                <div className="flex">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary bg-opacity-20 rounded-full flex items-center justify-center mr-4 mt-1">
                    <span className="text-primary font-bold">4</span>
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">Create the Story</h4>
                    <p>
                      Click the "Create New Story" button to publish your story.
                      This will require a transaction with your Solana wallet to
                      use your $LORE tokens.
                    </p>
                  </div>
                </div>
              </div>

              <h3 className="text-xl font-medium mb-3">
                Tips for Creating Engaging Stories
              </h3>

              <div className="bg-gray-800 rounded-lg p-4 mb-6">
                <ul className="list-disc list-inside space-y-2">
                  <li>
                    <span className="font-medium">
                      Start with an intriguing premise
                    </span>{" "}
                    that leaves room for development
                  </li>
                  <li>
                    <span className="font-medium">Choose a clear genre</span> to
                    help guide contributors
                  </li>
                  <li>
                    <span className="font-medium">
                      Make your first sentence compelling
                    </span>{" "}
                    but open-ended
                  </li>
                  <li>
                    <span className="font-medium">Consider the pacing</span> -
                    don't reveal too much too quickly
                  </li>
                  <li>
                    <span className="font-medium">
                      Introduce a character or setting
                    </span>{" "}
                    that others can build upon
                  </li>
                </ul>
              </div>

              <p>
                After creating your story, it will appear on the Stories page
                and be open for submissions. As the creator, you can track its
                progress and participate in voting for continuations.
              </p>
            </div>
          </section>

          {/* Submitting Continuations */}
          <section id="submitting-continuations" className="scroll-mt-8">
            <div className="card">
              <h2 className="text-2xl font-bold mb-4 flex items-center">
                <PenTool className="w-6 h-6 mr-2 text-primary" />
                Submitting Continuations
              </h2>

              <p className="mb-4">
                Contributing to stories is at the heart of Lore.Fun. By
                submitting continuations, you help shape the narrative and
                potentially earn rewards if your submission is selected.
              </p>

              <h3 className="text-xl font-medium mb-3">
                Requirements for Submitting
              </h3>
              <ul className="list-disc list-inside space-y-2 mb-6">
                <li>You must have a connected Solana wallet</li>
                <li>You must hold $LORE tokens</li>
                <li>Submissions must be a single sentence</li>
                <li>Submissions must be between 10-50 words</li>
                <li>
                  Content must be consistent with the story's established tone
                  and plot
                </li>
              </ul>

              <h3 className="text-xl font-medium mb-3">
                How to Submit a Continuation
              </h3>

              <div className="space-y-6 mb-6">
                <div className="flex">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary bg-opacity-20 rounded-full flex items-center justify-center mr-4 mt-1">
                    <span className="text-primary font-bold">1</span>
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">
                      Find a Story to Contribute To
                    </h4>
                    <p>
                      Browse the Stories page to find an ongoing story you'd
                      like to contribute to. Click on a story to view its
                      current content.
                    </p>
                  </div>
                </div>

                <div className="flex">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary bg-opacity-20 rounded-full flex items-center justify-center mr-4 mt-1">
                    <span className="text-primary font-bold">2</span>
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">
                      Navigate to the Submission Page
                    </h4>
                    <p>
                      On the story page, click the "Submit Next Sentence"
                      button. This will take you to the submission form.
                    </p>
                  </div>
                </div>

                <div className="flex">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary bg-opacity-20 rounded-full flex items-center justify-center mr-4 mt-1">
                    <span className="text-primary font-bold">3</span>
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">Review the Last Sentence</h4>
                    <p>
                      The submission page will show you the last sentence of the
                      story. Read it carefully to ensure your continuation flows
                      naturally from this point.
                    </p>
                  </div>
                </div>

                <div className="flex">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary bg-opacity-20 rounded-full flex items-center justify-center mr-4 mt-1">
                    <span className="text-primary font-bold">4</span>
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">Write Your Continuation</h4>
                    <p>
                      Craft your continuation in the text area provided.
                      Remember, it must be a single sentence between 10-50
                      words. The form will show you a word count to help you
                      stay within limits.
                    </p>
                  </div>
                </div>

                <div className="flex">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary bg-opacity-20 rounded-full flex items-center justify-center mr-4 mt-1">
                    <span className="text-primary font-bold">5</span>
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">Submit Your Continuation</h4>
                    <p>
                      Click the "Submit for Voting" button to send your
                      continuation. This will require a transaction with your
                      Solana wallet.
                    </p>
                  </div>
                </div>
              </div>

              <h3 className="text-xl font-medium mb-3">
                Tips for Writing Effective Continuations
              </h3>

              <div className="bg-gray-800 rounded-lg p-4 mb-6">
                <ul className="list-disc list-inside space-y-2">
                  <li>
                    <span className="font-medium">Maintain consistency</span>{" "}
                    with the story's tone, style, and established facts
                  </li>
                  <li>
                    <span className="font-medium">Advance the plot</span> in a
                    meaningful way
                  </li>
                  <li>
                    <span className="font-medium">Add depth</span> to characters
                    or settings when appropriate
                  </li>
                  <li>
                    <span className="font-medium">Create intrigue</span> that
                    encourages further development
                  </li>
                  <li>
                    <span className="font-medium">
                      Use descriptive language
                    </span>{" "}
                    to paint a vivid picture
                  </li>
                  <li>
                    <span className="font-medium">Consider pacing</span> - not
                    every sentence needs to be action-packed
                  </li>
                </ul>
              </div>

              <div className="bg-yellow-900 bg-opacity-30 border border-yellow-700 rounded-lg p-4">
                <h4 className="font-bold flex items-center mb-2">
                  <Info className="w-5 h-5 mr-2" />
                  Submission Timeline
                </h4>
                <p>
                  Submissions are open for 12 hours after each voting round
                  concludes. After the submission period ends, all submitted
                  continuations move to the voting phase, where the community
                  will select the winner.
                </p>
              </div>
            </div>
          </section>

          {/* Voting on Submissions */}
          <section id="voting" className="scroll-mt-8">
            <div className="card">
              <h2 className="text-2xl font-bold mb-4 flex items-center">
                <Vote className="w-6 h-6 mr-2 text-primary" />
                Voting on Submissions
              </h2>

              <p className="mb-4">
                Voting is how the community collectively decides which
                continuations become part of the story. Each voting round lasts
                3 days, after which the submission with the most votes is added
                to the story.
              </p>

              <h3 className="text-xl font-medium mb-3">
                Requirements for Voting
              </h3>
              <ul className="list-disc list-inside space-y-2 mb-6">
                <li>You must have a connected Solana wallet</li>
                <li>You must hold $LORE tokens</li>
                <li>You can only vote once per voting round</li>
              </ul>

              <h3 className="text-xl font-medium mb-3">How to Vote</h3>

              <div className="space-y-6 mb-6">
                <div className="flex">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary bg-opacity-20 rounded-full flex items-center justify-center mr-4 mt-1">
                    <span className="text-primary font-bold">1</span>
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">
                      Find a Story with Active Voting
                    </h4>
                    <p>
                      Browse the Stories page to find stories with active voting
                      rounds. These will typically show "Voting Ends in X days"
                      in their information.
                    </p>
                  </div>
                </div>

                <div className="flex">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary bg-opacity-20 rounded-full flex items-center justify-center mr-4 mt-1">
                    <span className="text-primary font-bold">2</span>
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">
                      Navigate to the Voting Page
                    </h4>
                    <p>
                      On the story page, you'll see a section showing current
                      submissions. Click the "Vote" button to access the full
                      voting interface.
                    </p>
                  </div>
                </div>

                <div className="flex">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary bg-opacity-20 rounded-full flex items-center justify-center mr-4 mt-1">
                    <span className="text-primary font-bold">3</span>
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">Review the Submissions</h4>
                    <p>
                      Read through all the submitted continuations. Consider how
                      each one would affect the story's direction and quality.
                    </p>
                  </div>
                </div>

                <div className="flex">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary bg-opacity-20 rounded-full flex items-center justify-center mr-4 mt-1">
                    <span className="text-primary font-bold">4</span>
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">
                      Select Your Preferred Continuation
                    </h4>
                    <p>
                      Click on the submission you want to vote for. This will
                      highlight your selection.
                    </p>
                  </div>
                </div>

                <div className="flex">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary bg-opacity-20 rounded-full flex items-center justify-center mr-4 mt-1">
                    <span className="text-primary font-bold">5</span>
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">Submit Your Vote</h4>
                    <p>
                      Click the "Submit Vote" button to cast your vote. This
                      will require a transaction with your Solana wallet.
                    </p>
                  </div>
                </div>
              </div>

              <h3 className="text-xl font-medium mb-3">
                Understanding Voting Results
              </h3>

              <p className="mb-4">
                Each submission shows its current standing as a percentage of
                total votes. After the voting period ends:
              </p>

              <ul className="list-disc list-inside space-y-2 mb-6">
                <li>
                  The submission with the highest percentage of votes is added
                  to the story
                </li>
                <li>
                  The author of the winning submission receives rewards in $LORE
                  tokens
                </li>
                <li>A new submission period begins for the next sentence</li>
              </ul>

              <div className="bg-yellow-900 bg-opacity-30 border border-yellow-700 rounded-lg p-4">
                <h4 className="font-bold flex items-center mb-2">
                  <Info className="w-5 h-5 mr-2" />
                  Voting Strategy
                </h4>
                <p>
                  When voting, consider not just which continuation you like
                  best, but which one will lead to the most interesting future
                  developments. The best stories often emerge from unexpected
                  turns and creative additions.
                </p>
              </div>
            </div>
          </section>

          {/* Your Profile */}
          <section id="profile" className="scroll-mt-8">
            <div className="card">
              <h2 className="text-2xl font-bold mb-4 flex items-center">
                <User className="w-6 h-6 mr-2 text-primary" />
                Your Profile
              </h2>

              <p className="mb-4">
                Your profile page is where you can track your activity on
                Lore.Fun, view your created stories, and manage your account.
              </p>

              <h3 className="text-xl font-medium mb-3">
                Accessing Your Profile
              </h3>
              <p className="mb-4">
                Once you've connected your wallet, you can access your profile
                by clicking on your username or "My Profile" in the navigation
                bar.
              </p>

              <h3 className="text-xl font-medium mb-3">Profile Features</h3>

              <div className="space-y-6 mb-6">
                <div className="flex">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary bg-opacity-20 rounded-full flex items-center justify-center mr-4 mt-1">
                    <span className="text-primary font-bold">1</span>
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">Account Information</h4>
                    <p>
                      View your username, wallet address, and account creation
                      date. This section helps identify you on the platform.
                    </p>
                  </div>
                </div>

                <div className="flex">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary bg-opacity-20 rounded-full flex items-center justify-center mr-4 mt-1">
                    <span className="text-primary font-bold">2</span>
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">Activity Stats</h4>
                    <p>Track your participation metrics, including:</p>
                    <ul className="list-disc list-inside space-y-1 ml-2 mt-2">
                      <li>Stories created</li>
                      <li>Submissions made</li>
                      <li>Winning submissions</li>
                      <li>Votes cast</li>
                    </ul>
                  </div>
                </div>

                <div className="flex">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary bg-opacity-20 rounded-full flex items-center justify-center mr-4 mt-1">
                    <span className="text-primary font-bold">3</span>
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">My Stories</h4>
                    <p>
                      View all the stories you've created. For each story, you
                      can see:
                    </p>
                    <ul className="list-disc list-inside space-y-1 ml-2 mt-2">
                      <li>Title and genre</li>
                      <li>Current sentence count</li>
                      <li>Number of contributors</li>
                      <li>Creation date</li>
                    </ul>
                  </div>
                </div>
              </div>

              <h3 className="text-xl font-medium mb-3">
                Managing Your Account
              </h3>

              <p className="mb-4">From your profile page, you can:</p>

              <ul className="list-disc list-inside space-y-2 mb-6">
                <li>
                  Create new stories by clicking the "Create New Story" button
                </li>
                <li>
                  View your story details by clicking on any story in your list
                </li>
                <li>Disconnect your wallet if needed</li>
              </ul>

              <div className="bg-yellow-900 bg-opacity-30 border border-yellow-700 rounded-lg p-4">
                <h4 className="font-bold flex items-center mb-2">
                  <Info className="w-5 h-5 mr-2" />
                  Username Changes
                </h4>
                <p>
                  Currently, usernames cannot be changed after they're set.
                  Choose your username carefully when you first connect your
                  wallet.
                </p>
              </div>
            </div>
          </section>

          {/* $LORE Tokens */}
          <section id="tokens" className="scroll-mt-8">
            <div className="card">
              <h2 className="text-2xl font-bold mb-4 flex items-center">
                <Coins className="w-6 h-6 mr-2 text-primary" />
                $LORE Tokens
              </h2>

              <p className="mb-4">
                $LORE tokens are the native cryptocurrency of the Lore.Fun
                platform. They're used for all interactions on the platform and
                serve as rewards for contributions.
              </p>

              <h3 className="text-xl font-medium mb-3">Token Utility</h3>

              <div className="space-y-6 mb-6">
                <div className="flex">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary bg-opacity-20 rounded-full flex items-center justify-center mr-4 mt-1">
                    <span className="text-primary font-bold">1</span>
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">Creating Stories</h4>
                    <p>
                      You need $LORE tokens to create new stories on the
                      platform. This ensures that story creators have a stake in
                      the ecosystem.
                    </p>
                  </div>
                </div>

                <div className="flex">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary bg-opacity-20 rounded-full flex items-center justify-center mr-4 mt-1">
                    <span className="text-primary font-bold">2</span>
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">Submitting Continuations</h4>
                    <p>
                      Submitting a continuation to an existing story requires
                      $LORE tokens. This helps maintain quality and prevent
                      spam.
                    </p>
                  </div>
                </div>

                <div className="flex">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary bg-opacity-20 rounded-full flex items-center justify-center mr-4 mt-1">
                    <span className="text-primary font-bold">3</span>
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">Voting</h4>
                    <p>
                      Casting votes on submissions requires $LORE tokens. This
                      ensures that voters have a stake in the quality of the
                      stories.
                    </p>
                  </div>
                </div>

                <div className="flex">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary bg-opacity-20 rounded-full flex items-center justify-center mr-4 mt-1">
                    <span className="text-primary font-bold">4</span>
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">Rewards</h4>
                    <p>
                      When your submission wins a voting round, you receive
                      $LORE tokens as a reward. This incentivizes quality
                      contributions.
                    </p>
                  </div>
                </div>
              </div>

              <h3 className="text-xl font-medium mb-3">
                Obtaining $LORE Tokens
              </h3>

              <p className="mb-4">
                There are several ways to obtain $LORE tokens:
              </p>

              <ul className="list-disc list-inside space-y-2 mb-6">
                <li>
                  <span className="font-medium">Winning submissions:</span> Earn
                  tokens when your continuations are selected by the community
                </li>
                <li>
                  <span className="font-medium">Token exchanges:</span> $LORE
                  tokens can be purchased on supported Solana DEXes
                </li>
                <li>
                  <span className="font-medium">Community events:</span>{" "}
                  Participate in special events and contests to win tokens
                </li>
              </ul>

              <div className="bg-yellow-900 bg-opacity-30 border border-yellow-700 rounded-lg p-4">
                <h4 className="font-bold flex items-center mb-2">
                  <Info className="w-5 h-5 mr-2" />
                  Token Economics
                </h4>
                <p>
                  $LORE has a fixed supply, making it a deflationary token. As
                  the platform grows and more stories are created, the value of
                  $LORE is designed to increase, rewarding early participants
                  and quality contributors.
                </p>
              </div>
            </div>
          </section>

          {/* Back to Top Button */}
          <div className="flex justify-center mt-8">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="flex items-center space-x-2 bg-primary bg-opacity-20 hover:bg-opacity-30 text-primary px-4 py-2 rounded-md transition-all"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 10l7-7m0 0l7 7m-7-7v18"
                />
              </svg>
              <span>Back to Top</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
