import { useRouter } from 'next/router'
import { Header, Sidebar } from '../../layout'
import React, { useContext, useEffect, useState } from 'react'
import { Background, Player, Video as RelatedVideos } from '../../components'
import { apolloClient } from '../../clients'
import { ESSENCE_BY_ID, GET_ALL_ESSENCE_VIDEOS } from '../../graphql'
import Link from 'next/link'
import moment from 'moment'
import { BiCheck } from 'react-icons/bi'
import Avvvatars from 'avvvatars-react'
import { IPostCard, IVideo } from '../../types'
import { essenceResponseToVideo } from "../../utils";
import { AuthContext } from '../../context/auth'
import CollectBtn from '../../components/Buttons/CollectBtn'
import {ESSENCE_APP_ID} from '../../constants'

export default function Video() {
  const router = useRouter()
  const { id } = router.query
  const [video, setVideo] = useState<IVideo | null>(null)
  const [essence, setEssence] = useState<IPostCard>(null)
  const [relatedVideos, setRelatedVideos] = useState<IVideo[]>([])
  const {address} =  useContext(AuthContext)
  const fetchVideos = () => {
    apolloClient.query({
      query: ESSENCE_BY_ID,
      variables: {
        metadataId: id,
        me: address
      },
      fetchPolicy: 'network-only',
    })
      .then(({ data }) => {
        console.log('EssenceByID video page res:', data)
        const currentEssence = data?.essenceByFilter[0] || {}
        console.log("currentEssence", currentEssence)
        setEssence(currentEssence)
        const parsedVideos = data.essenceByFilter.map((essence: any) => essenceResponseToVideo(essence));
        console.log("parsedVideos", parsedVideos)
        const video = parsedVideos.find((video) => video.id === id)
        console.log("setting video", video)
        setVideo(video)
        console.log("Category", video.category)
      })
      .catch((err) => {
        console.log('err', err)
      })
  }
  const fetchRelatedVideos = () => {
    apolloClient.query({
      query: GET_ALL_ESSENCE_VIDEOS,
      variables: {
        appID: ESSENCE_APP_ID,
        me: address,
      },
      fetchPolicy: 'network-only',
    })
      .then(({ data }) => {
        console.log('GET_ALL_ESSENCE_VIDEOS video page res:', data)
        const essenceNodes = data.essencesBy?.edges.map((edge: any) => edge.node) || [];
        const parsedVideos = essenceNodes.map((essence: any) => essenceResponseToVideo(essence));
        setRelatedVideos(parsedVideos.filter((v) => v.id !== id))
      })
      .catch((err) => {
        console.log('err', err)
      })
  }

  useEffect(() => {
    fetchVideos()
    fetchRelatedVideos()
  }, [id])

  return (
    <Background className="flex  h-screen w-full flex-row">
      <Sidebar updateCategory={(category) => router.push('/home')} />
      <div className="flex flex-1 flex-col">
        <Header />
        {video && (
          <div className="m-10 flex flex-col justify-between	  lg:flex-row">
            <div className="w-6/6 lg:w-4/6">
              <Player id={video.hash} />
              <div className="border-border-light dark:border-border-dark flex flex-row justify-between border-b-2 py-4">
                <div>
                  <h3 className="text-transform: text-2xl capitalize dark:text-white">
                    {video.title}
                  </h3>
                  <p className="mt-1 text-gray-500 ">
                    {video.category} •{' '}
                    {moment(Date.parse(video.date)).fromNow()}
                  </p>
                </div>
                <div className="flex flex-row items-center">
                  <CollectBtn profileID={essence.createdBy.profileID} essenceID={essence.essenceID} isCollectedByMe={essence.isCollectedByMe} collectMw={essence.collectMw} nftAddress={essence.contractAddress} /> 
                </div>
              </div>
              <div>
                <div className="mt-5 flex flex-row items-center ">
                  <div className="w-12">
                    <Avvvatars value={video?.handle} size={50} />
                  </div>
                  <div className="ml-3 flex flex-col">
                    <p className="text-md mt-1 flex items-center text-black dark:text-white">
                      {video.handle}...{' '}
                      <BiCheck size="20px" className="fill-gray ml-1" />
                    </p>
                    <p className="text-subtitle-light flex items-center text-sm ">
                      Video by {video.handle}
                    </p>
                  </div>
                </div>
                <p className="text-text-light dark:text-text-dark text-textSubTitle mt-4 ml-16 text-sm">
                  {video.description}
                </p>
              </div>
            </div>
            <div className="w-2/6">
              <h4 className="text-md ml-5 mb-3 font-bold text-black dark:text-white">
                Related Videos
              </h4>
              {relatedVideos.map((video) => (
                <Link href={`/video/${video.id}`} key={video.id}>
                  <RelatedVideos video={video} horizontal={true} />
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </Background>
  )
}
