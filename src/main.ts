import { Client, GuildMember, Intents, Presence } from "discord.js"
import dotenv from "dotenv"

dotenv.config()

const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_PRESENCES],
})

client.on("ready", async () => {
  const guild = await client.guilds.fetch(process.env.DISCORD_GUILD_ID!)

  await guild.commands.set([
    {
      name: "sync-status-role",
      description: "Sync status role.",
    },
  ])

  await client.user?.setPresence({
    activities: [
      {
        name: process.env.STATUS,
      },
    ],
  })

  console.log("Ready")
})

client.on("presenceUpdate", async (oldPresence, newPresence) => {
  await syncStatusRole(newPresence)
})

client.on("interactionCreate", async (interaction) => {
  if (
    interaction.isCommand() &&
    interaction.guild?.id === process.env.DISCORD_GUILD_ID! &&
    interaction.commandName === "sync-status-role"
  ) {
    const status = await syncStatusRole(
      (interaction.member as GuildMember).presence
    )

    if (status === null) {
      await interaction.reply("Syncing status role unsuccessful.")
    } else if (status) {
      await interaction.reply("Synced status role successfully.")
    } else {
      if (process.env.MODE === "exclusive") {
        await interaction.reply(
          `Your custom status is not set to \`${process.env.STATUS}\`!\n` +
            `Please note that it may not contain anything else.`
        )
      } else if (process.env.MODE === "start") {
        await interaction.reply(
          `Your custom status does not start with \`${process.env.STATUS}\`!\n` +
            `Please note that this must be at the beginning.`
        )
      }
    }
  }
})

client.login(process.env.DISCORD_TOKEN)

async function syncStatusRole(
  presence: Presence | null
): Promise<boolean | null> {
  if (
    !presence ||
    !presence.member ||
    presence.member?.guild.id !== process.env.DISCORD_GUILD_ID! ||
    presence.status === "offline"
  ) {
    return null
  }

  await presence.member.fetch()

  if (
    presence.activities.some(
      (activity) => activity.type === "CUSTOM" && checkState(activity.state!)
    )
  ) {
    if (!presence.member.roles.cache.has(process.env.DISCORD_ROLE_ID!)) {
      await presence.member.roles.add(process.env.DISCORD_ROLE_ID!)
    }

    return true
  } else {
    if (presence.member.roles.cache.has(process.env.DISCORD_ROLE_ID!)) {
      await presence.member.roles.remove(process.env.DISCORD_ROLE_ID!)
    }

    return false
  }
}

function checkState(state: string) {
  if (process.env.MODE === "exclusive") {
    return state === process.env.STATUS
  } else if (process.env.MODE === "start") {
    return state.startsWith(process.env.STATUS!)
  } else {
    return state.includes(process.env.STATUS!)
  }
}
