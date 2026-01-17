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

  async function vote(id: number) {
    setLoading(true)
    await writeContract(config, {
      address: Voting.address as `0x${string}`,
      abi: Voting.abi,
      functionName: "vote",
      args: [id],
    })
    await fetchCandidates()
    setLoading(false)
  }

  async function closeVoting() {
    await writeContract(config, {
      address: Voting.address as `0x${string}`,
      abi: Voting.abi,
      functionName: "closeVoting",
    })
    alert("Voting Closed Successfully")
  }

  useEffect(() => {
    fetchCandidates()
    fetchOwner()
  }, [])

  return (
    <div style={{ padding: 30 }}>
      <h2>DAO Voting (Local Anvil)</h2>

      {!isConnected ? (
        <button onClick={() => connect({ connector: injected() })}>
          Connect Wallet
        </button>
      ) : (
        <div>
          <p>Connected: {address}</p>
          <button onClick={disconnect as any}>Disconnect</button>
        </div>
      )}

      <hr />

      {isConnected && owner.toLowerCase() === address?.toLowerCase() && (
        <button
          style={{ background: "crimson", color: "white", marginBottom: 15 }}
          onClick={closeVoting}
        >
          Close Voting (Admin)
        </button>
      )}

      {candidates.map((c, i) => (
        <div key={i} style={{ marginBottom: 10 }}>
          <b>{c.name}</b> — Votes: {Number(c.voteCount)}
          <button
            style={{ marginLeft: 10 }}
            disabled={!isConnected || loading}
            onClick={() => vote(i)}
          >
            Vote
          </button>
        </div>
      ))}
    </div>
  )
}
