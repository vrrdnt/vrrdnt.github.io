+++
date = '2025-09-15T18:27:13+09:00'
draft = false
title = 'minecraft server hosting'
+++
in this post i'm aiming to illustrate the methods available to you in hosting a minecraft server (and anything else, really.) there's a lot of ways to do it!

---

## cloud hosting providers

cloud hosting is preferable if you are not interested in building your own server, and there's a few reasons you might not want to:
- energy cost
- noise
- bad home networking
- responsibility of security

below are some cloud hosting providers and their pros and cons.

### [OVH](https://us.ovhcloud.com/vps/)

| pros                                                                      | cons                                    |
|---------------------------------------------------------------------------|-----------------------------------------| 
| cheap dedicated hardware                                                  | control panel is dated, billing is slow |
| game-specific servers have ddos mitigation built-in                       |                                         
| decent hardware options for the price (e.g., ryzen, intel i7/i9, ecc ram) |                                         
| good for long-term hosting if you don’t mind the setup                    |                                         

### [DigitalOcean](https://www.digitalocean.com/pricing/droplets)

| pros                                                                      | cons                                    |
|---------------------------------------------------------------------------|-----------------------------------------| 
| fast to spin up                                                           | network bandwidth caps exist
| ideal for small vanilla servers or dev testing                            | not ideal for big modpacks or many players
| plans from $4/month                                                       | cpu performance can be pretty limited 

### [AWS EC2](https://aws.amazon.com/ec2/)

| pros                                                                      | cons                                    |
|---------------------------------------------------------------------------|-----------------------------------------| 
| flexible                                                                  | expensive  
| fine-tuned instance selection (use t4g/t3a for cheap burstable, c7g for modded) | egress bandwidth is not free  
| ebs + efs for storage (fast!) | too expensive unless you're using free tier or spot instances smartly 
| | aws control panel is fucking insane

 

## building your own (my personal favorite)

if you have decent home networking (at least a gigabit up+down) self-hosting might be for you.

| pros                                                                      | cons                                    |
|---------------------------------------------------------------------------|-----------------------------------------| 
| upfront cost for parts or a used server  | noise, power, cooling, and reliability are your problem 
| full control, no monthly fees for the server itself  
| great if you already have a proxmox node or nas  

getting the right parts for a server can be tricky. you can generally get better stuff since you don't have to worry about getting a GPU, unless you go with an AMD cpu and want to do Plex transcoding and shit like that.
when it comes to minecraft, you want to aim for the best [single-thread performance](https://www.cpubenchmark.net/singleThread.html) you can afford.

---

## notes about server management and networking

if you're running a server at your house, you have to port forward. do not forget to port forward.
minecraft, by default, broadcasts the server on port 25565. if you don't have this forwarded in your router management interface, people outside your network will not be able to connect to it.
you can totally do some hacky shit with tailscale or wireguard, but that's up to you.

additionally, it's probably a good idea to harden your server's security. you should only use a SSH key to log in to your server, and you should consider changing the port the SSH server listens on. i think by default it's port 22, and there are thousands of scanners on the internet that *will* find your server if SSH is on port 22. disabling password authentication and only using a key helps mitigate security concerns.

lastly, do not run your minecraft server as root. if you're not using docker and are just using a systemd service, create a `minecraft` user and group and use that user to run the minecraft server.

## recommended server stack

### base os

use ubuntu server 24.04.

### server runtime

it's your choice when it comes to how you manage the server. i prefer to use [docker](https://www.docker.com/) for running any game server, but i'm generally running more than one at a time.
if you're only going to be running one server at a time, you can absolutely get away with using a systemd service to manage the server. to start the server you'd run `systemctl start minecraft`, and you'd run `systemctl stop minecraft` to stop it. magical.

if you are interested in using docker, you can install either [Pterodactyl](https://pterodactyl.io/) or [Pelican](https://pelican.dev/). pelican is a fork of pterodactyl, and looks better imo. they both use docker to manage your game servers, and use a Nest/Egg system to handle server installation and configuration -- this makes it easy to run servers only built for Windows, which is nice.

---

## modded notes

- always use a start script or docker image with the right flags  
- most modpacks (ATM, FTB, etc.) use forge or fabric  
- server RAM: minimum 6–8GB for large packs  
- keep `max-tick-time=-1` for debugging long tick hangs  
- log monitoring helps (multilog, journalctl, etc.)  

---

## pros and cons summary

| option        | pros                         | cons                                |
|---------------|------------------------------|--------------------------------------|
| ovh           | cheap, powerful              | old UI, bad support                  |
| digitalocean  | fast deploy, clean UI        | not good for modded, expensive cpu   |
| aws ec2       | flexible, scalable           | expensive, billing is confusing      |
| home server   | full control, no fees        | uptime, noise, power, manual upkeep  |

---

## closing thoughts

if you want full control and already run other services, self-host. if you want convenience and a clean UI, use digitalocean or ovh. if you're managing multiple servers or users, pterodactyl/pelican is worth the setup. docker is ideal for isolation and repeatability. keep backups automated, monitor performance, and version-lock mods.
