import { useEffect, useState } from "react"
import { useAccount, useConnect, useDisconnect } from "wagmi"
import { injected } from "wagmi/connectors"
import { readContract, writeContract } from "@wagmi/core"
import Voting from "./Voting.json"
import { config } from "./wagmi"

type Candidate = {
  name: string
  voteCount: bigint
}

export default function App() {
  const { address, isConnected } = useAccount()
  const { connect } = useConnect()
  const { disconnect } = useDisconnect()

  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [owner, setOwner] = useState<string>("")
  const [votingOpen, setVotingOpen] = useState<boolean>(true)
  const [loading, setLoading] = useState(false)

  async function fetchCandidates() {
    const data = await readContract(config, {
      address: Voting.address as `0x${string}`,
      abi: Voting.abi,
      functionName: "getAllCandidates",
    })
    setCandidates(data as Candidate[])
  }

  async function fetchOwner() {
    const data = await readContract(config, {
      address: Voting.address as `0x${string}`,
      abi: Voting.abi,
      functionName: "owner",
    })
    setOwner(data as string)
  }

  async function fetchVotingStatus() {
    const data = await readContract(config, {
      address: Voting.address as `0x${string}`,
      abi: Voting.abi,
      functionName: "votingOpen",
    })
    setVotingOpen(data as boolean)
  }

  async function refresh() {
    await fetchCandidates()
    await fetchOwner()
    await fetchVotingStatus()
  }

  async function vote(id: number) {
    setLoading(true)
    await writeContract(config, {
      address: Voting.address as `0x${string}`,
      abi: Voting.abi,
      functionName: "vote",
      args: [id],
    })
    await refresh()
    setLoading(false)
  }

  async function closeVoting() {
    await writeContract(config, {
      address: Voting.address as `0x${string}`,
      abi: Voting.abi,
      functionName: "closeVoting",
    })
    await refresh()
  }

  useEffect(() => {
    refresh()
  }, [])

  const winner =
    candidates.length > 0
      ? candidates.reduce((prev, curr) =>
          curr.voteCount > prev.voteCount ? curr : prev
        )
      : null

  return (
    <div className="min-h-screen bg-black text-white">

      {/* Top Bar */}
      <div className="flex justify-between items-center p-6">
        <h1 className="text-xl font-bold text-orange-500">
          Voting DApp – GDG
        </h1>
        {isConnected && (
          <button
            onClick={disconnect as any}
            className="border border-orange-500 px-4 py-2 rounded hover:bg-orange-500 hover:text-black"
          >
            Disconnect
          </button>
        )}
      </div>

      {/* Hero */}
      <div className="flex flex-col items-center justify-center text-center py-24 px-6 bg-gradient-to-r from-orange-600 to-red-700">
        <h2 className="text-5xl font-extrabold mb-4">
          Decentralized Voting System
        </h2>
        <p className="max-w-2xl text-lg text-orange-100">
          Trustless. Transparent. On-Chain Governance for the Future of DAOs.
        </p>

        {!isConnected && (
          <button
            onClick={() => connect({ connector: injected() })}
            className="mt-8 bg-black text-orange-400 px-8 py-3 rounded-lg font-semibold hover:bg-gray-900"
          >
            Connect Wallet
          </button>
        )}
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto mt-12 p-6">

        {isConnected && owner.toLowerCase() === address?.toLowerCase() && votingOpen && (
          <button
            onClick={closeVoting}
            className="bg-red-600 px-6 py-3 rounded mb-6 hover:bg-red-700"
          >
            Close Voting (Admin)
          </button>
        )}

        {!votingOpen && winner && (
          <div className="bg-gray-900 p-6 rounded-xl shadow-lg">
            <h3 className="text-2xl font-bold text-orange-400 mb-3">
              🏁 Voting Ended
            </h3>
            <p className="mb-4">
              Winner: <span className="text-green-400">{winner.name}</span>
            </p>

            <table className="w-full border border-gray-700">
              <thead className="bg-gray-800">
                <tr>
                  <th className="p-3 text-left">Candidate</th>
                  <th className="p-3 text-right">Votes</th>
                </tr>
              </thead>
              <tbody>
                {candidates.map((c, i) => (
                  <tr key={i} className="border-t border-gray-700">
                    <td className="p-3">{c.name}</td>
                    <td className="p-3 text-right">{Number(c.voteCount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {votingOpen &&
          candidates.map((c, i) => (
            <div
              key={i}
              className="flex justify-between items-center bg-gray-900 p-4 rounded-lg mb-3"
            >
              <span className="font-semibold">{c.name}</span>
              <div className="flex items-center gap-4">
                <span>{Number(c.voteCount)}</span>
                <button
                  disabled={!isConnected || loading}
                  onClick={() => vote(i)}
                  className="bg-orange-500 text-black px-4 py-2 rounded hover:bg-orange-600"
                >
                  Vote
                </button>
              </div>
            </div>
          ))}
      </div>
    </div>
  )
}
