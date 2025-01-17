import { Box, Button, FormControl, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Spinner, useDisclosure, useToast } from "@chakra-ui/react"
import { useState } from "react"
import { ChatState } from "../../Context/ChatProvider"
import axios from "axios"
import Server_URL from "../../Server_URL"
import UserListItem from "../UserAvatar/UserListItem"
import UserBadgeItem from "./UserBadgeItem"

function GroupChatModal({ children }) {

    const { isOpen, onOpen, onClose } = useDisclosure()
    const [groupChatName, setGroupChatName] = useState()
    const [selectedUsers, setSelectedUsers] = useState([])
    const [search, setSearch] = useState("")
    const [searchResult, setSearchResult] = useState([])
    const [loading, setLoading] = useState(false)

    const toast = useToast();

    const { user, chats, setChats } = ChatState();

    const handleSearch = async (query) => {
        setSearch(query)
        if (query !== "") {
            setLoading(true);
        }
        if (!query) {
            return;
        }

        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`
                }
            };

            const { data } = await axios.get(`${Server_URL}/api/user?search=${search}`, config);
            setLoading(false);
            setSearchResult(data);
        } catch (error) {
            setLoading(false)
            toast({
                title: "Error Occured!",
                description: "Failed to Load the Search Results",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom-left"
            });
        }
    }


    const handleSubmit = async () => {
        if (!groupChatName || !selectedUsers) {
            toast({
                title: "Please fill all the feilds",
                status: "warning",
                duration: 5000,
                isClosable: true,
                position: "bottom"
            });
        }

        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`
                }
            };

            const { data } = await axios.post(`${Server_URL}/api/chat/group`,
                {
                    name: groupChatName,
                    users: selectedUsers,
                },
                config
            );
            setChats([data, ...chats]);
            onClose();
            toast({
                title: "New Group Chat Created!",
                status: "success",
                duration: 5000,
                isClosable: true,
                position: "bottom"
            });
        } catch (error) {
            toast({
                title: "Failed to Create the Chat!",
                description: error.response.data,
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom"
            });
        }
    }
    const handleGroup = (userToAdd) => {
        if (selectedUsers.includes(userToAdd)) {
            toast({
                title: "User already added",
                status: "warning",
                duration: 3000,
                isClosable: true,
                position: "top"
            });
            return;
        }

        setSelectedUsers([...selectedUsers, userToAdd]);
    }

    const handleDelete = (delUser) => {
        setSelectedUsers(selectedUsers.filter(sel => sel._id !== delUser._id));
    }
    return (
        <div>
            <span onClick={onOpen}>{children}</span>

            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader
                        fontSize='35px'
                        fontFamily='Work sans'
                        display='flex'
                        justifyContent='center'
                    >
                        Create Group Chat
                    </ModalHeader>
                    <ModalCloseButton />
                    <ModalBody display='flex' flexDirection='column' alignItems='center' >
                        <FormControl>
                            <Input placeholder="Chat Name" mb={3} onChange={(e) => setGroupChatName(e.target.value)} />
                        </FormControl>
                        <FormControl>
                            <Input placeholder="Add Users eg: John, Jane, Sam" mb={1} onChange={(e) => handleSearch(e.target.value)} />
                        </FormControl>
                        <Box w='100%' display='flex' flexWrap='wrap'>
                            {selectedUsers.map(u => (
                                <UserBadgeItem key={user._id} user={u} handleFunction={() => handleDelete(u)} />
                            ))}
                        </Box>
                        <Box w='100%'>
                            {loading ? <Spinner ml='auto' display='flex' /> : (

                                searchResult?.slice(0, 4).map(user => (
                                    <UserListItem key={user._id} user={user} handleFunction={() => handleGroup(user)} />
                                ))
                            )}
                        </Box>
                    </ModalBody>

                    <ModalFooter>
                        <Button colorScheme='blue' onClick={handleSubmit}>
                            Create Chat
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </div >
    )
}

export default GroupChatModal